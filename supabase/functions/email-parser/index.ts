import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

// Konfigurasi CORS jika dipanggil dari browser/client lain
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Inisialisasi Supabase Client menggunakan environment variable bawaan Deno/Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log("Menerima webhook payload:", JSON.stringify(payload))

    // Helper untuk mengambil value dari object bersarang
    const getNested = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

    // Ekstrak pengirim, subjek, dan isi teks dari berbagai kemungkinan struktur JSON (Pipedream, Zapier, Make, dll)
    let fromEmail = payload.from || payload.sender || getNested(payload, 'headers.from') || getNested(payload, 'message.from') || getNested(payload, 'mail.source') || "";
    if (Array.isArray(fromEmail) && fromEmail.length > 0 && fromEmail[0].address) {
        fromEmail = fromEmail[0].address; 
    } else if (typeof fromEmail === 'object' && fromEmail !== null) {
        fromEmail = (fromEmail as any).value?.[0]?.address || (fromEmail as any).text || (fromEmail as any).address || JSON.stringify(fromEmail);
    }

    let subject = payload.subject || getNested(payload, 'headers.subject') || getNested(payload, 'message.subject') || payload.title || "";
    
    let bodyText = payload.text || payload.plain || payload.body_plain || payload.content || getNested(payload, 'body.text') || getNested(payload, 'message.text') || getNested(payload, 'body.plain') || "";
    
    // Fallback jika body dikirim sebagai string langsung
    if (!bodyText && payload.body && typeof payload.body === 'string') {
        bodyText = payload.body;
    }

    // Pastikan semua bertipe string
    fromEmail = String(fromEmail);
    subject = String(subject);
    bodyText = String(bodyText);

    if (!bodyText || bodyText === "undefined") {
      return new Response(JSON.stringify({ 
        error: "Email body text tidak ditemukan di payload.",
        debug_payload_received: JSON.stringify(payload, null, 2)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      })
    }

    let transactionData = null;

    // --- DETEKSI JENIS EMAIL ---
    const fromEmailLower = fromEmail.toLowerCase()
    const subjectLower = subject.toLowerCase()
    const bodyTextLower = bodyText.toLowerCase() // Untuk membaca email yg di-forward

    if (fromEmailLower.includes("gojek.com") || subjectLower.includes("gopay") || bodyTextLower.includes("gojek.com")) {
      transactionData = parseGoPayEmail(bodyText)
    } else if (fromEmailLower.includes("bca.co.id") || subjectLower.includes("bca") || bodyTextLower.includes("bca.co.id")) {
      transactionData = parseBcaEmail(bodyText)
    } else if (fromEmailLower.includes("bni.co.id") || subjectLower.includes("wondr") || bodyTextLower.includes("bni.co.id")) {
      transactionData = parseBniEmail(bodyText)
    } else {
      // Deteksi fallback jika ada kata kunci transfer/bayar yang jelas di body text
      if (bodyTextLower.includes("transfer berhasil") || bodyTextLower.includes("pembayaran berhasil") || bodyTextLower.includes("transaksi berhasil")) {
        transactionData = parseGenericEmail(bodyText)
      }
    }

    // --- INSERT KE SUPABASE ---
    if (transactionData) {
      console.log("Hasil parsing transaksi:", transactionData)

      // Coba ambil user_id pertama dari tabel profiles (asumsi single-user untuk mempermudah)
      const { data: profiles } = await supabase.from('profiles').select('id').limit(1)
      const userId = profiles && profiles.length > 0 ? profiles[0].id : null

      // Sesuaikan amount dengan logika frontend:
      // Frontend (useStore.js): balance = balance - amount
      // Jadi: Expense = positif, Income = negatif
      const finalAmount = transactionData.type === 'income' ? -transactionData.amount : transactionData.amount

      // Default wallet: 'BNI' untuk BCA/BNI, atau 'Cash'
      let defaultWallet = 'Cash'
      if (transactionData.description.toLowerCase().includes('bni')) defaultWallet = 'BNI'
      else if (transactionData.description.toLowerCase().includes('bca')) defaultWallet = 'BCA'
      else if (transactionData.description.toLowerCase().includes('gopay')) defaultWallet = 'GoPay'

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          amount: finalAmount,
          note: transactionData.description,
          category: transactionData.category || "Uncategorized",
          date: transactionData.date || new Date().toISOString(),
          wallet: defaultWallet
        }])
        .select()

      if (error) {
        console.error("Gagal insert ke Supabase:", error)
        throw error
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Transaksi berhasil dicatat!",
        data: data
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      })
    }

    return new Response(JSON.stringify({
      success: false,
      message: "Tidak ada pola transaksi yang cocok dikenali dari teks email."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})

// ==========================================
// UTILITY FUNCTIONS: PARSER MENGGUNAKAN REGEX
// ==========================================

function cleanHtml(html: string) {
  // Membersihkan tag HTML agar mudah diparsing jika dikirim dalam bentuk HTML
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function parseBniEmail(text: string) {
  const cleanText = cleanHtml(text)

  // Mencari "Nominal Rp70.630" atau "Total Rp70.630"
  const amountRegex = /(?:Nominal|Total)\s*(?:Rp|Rp\.|IDR)\s?([0-9.,]+)/i
  const amountMatch = cleanText.match(amountRegex)

  if (amountMatch) {
    const rawAmount = amountMatch[1].replace(/[.,]/g, "")
    const amount = parseInt(rawAmount, 10)

    // Mencari Penerima (Merchant) -> "Penerima Shopee Indonesia KOTA"
    const merchantRegex = /Penerima\s*(.+?)\s*(?:Sumber dana|KOTA|KABUPATEN)/i
    const merchantMatch = cleanText.match(merchantRegex)
    const merchant = merchantMatch ? merchantMatch[1].trim() : "Transaksi BNI"

    return {
      amount,
      description: `BNI: ${merchant}`,
      type: "expense",
      category: "Bank",
      date: new Date().toISOString()
    }
  }
  return null
}

function parseGoPayEmail(text: string) {
  const cleanText = cleanHtml(text)
  // Pattern: "Kamu sudah bayar sebesar Rp 15.000 ke Kopi Kenangan pakai GoPay"
  const amountRegex = /(?:Rp|Rp\s?|IDR\s?)([0-9.,]+)/i
  const merchantRegex = /(?:ke|to|di|at)\s([^,.\n]+)(?:\spakai|\susing)/i

  const amountMatch = text.match(amountRegex)
  const merchantMatch = text.match(merchantRegex)

  if (amountMatch) {
    const rawAmount = amountMatch[1].replace(/[.,]/g, "")
    const amount = parseInt(rawAmount, 10)
    const merchant = merchantMatch ? merchantMatch[1].trim() : "Transaksi GoPay"

    return {
      amount,
      description: `GoPay: ${merchant}`,
      type: "expense",
      category: "E-Wallet",
      date: new Date().toISOString()
    }
  }
  return null
}

function parseBcaEmail(text: string) {
  const cleanText = cleanHtml(text)
  // Pattern: "Telah melakukan transaksi TRANSFER sebesar Rp. 50.000 ke Rekening 123456789"
  const amountRegex = /(?:Rp\.|Rp\s?|IDR\s?)([0-9.,]+)/i
  const amountMatch = cleanText.match(amountRegex)

  if (amountMatch) {
    const rawAmount = amountMatch[1].replace(/[.,]/g, "")
    const amount = parseInt(rawAmount, 10)

    let type = "expense"
    let desc = "Transaksi BCA"

    if (cleanText.toUpperCase().includes("MASUK") || cleanText.toUpperCase().includes("KREDIT")) {
      type = "income"
      desc = "Transfer Masuk BCA"
    } else if (cleanText.toUpperCase().includes("KELUAR") || cleanText.toUpperCase().includes("DEBET") || cleanText.toUpperCase().includes("TRANSFER")) {
      type = "expense"
      desc = "Transfer Keluar BCA"
    }

    return {
      amount,
      description: desc,
      type,
      category: "Bank",
      date: new Date().toISOString()
    }
  }
  return null
}

function parseGenericEmail(text: string) {
  const cleanText = cleanHtml(text)
  const amountRegex = /(?:Rp|Rp\.|IDR)\s?([0-9.,]+)/i
  const amountMatch = cleanText.match(amountRegex)

  if (amountMatch) {
    const rawAmount = amountMatch[1].replace(/[.,]/g, "")
    const amount = parseInt(rawAmount, 10)

    let type = cleanText.toLowerCase().includes("masuk") ? "income" : "expense"

    return {
      amount,
      description: "Auto-parsed Transaction",
      type,
      category: "Uncategorized",
      date: new Date().toISOString()
    }
  }
  return null
}
