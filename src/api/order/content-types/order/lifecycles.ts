export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    if (!data.trackid) {
      data.trackid = Math.floor(10000000 + Math.random() * 90000000);
    }
  },

  async afterCreate(event: any) {
    const { result } = event;

    // 1. Send Email Notification to info@bronkoe.in via Strapi Email Service
    try {
      const orderItems = Array.isArray(result.items)
        ? result.items.map((item: any) => `${item.name} (Size ${item.size}) x ${item.quantity} = ${item.price}`).join("\n")
        : JSON.stringify(result.items);

      const emailSubject = `New Retail Order #${result.trackid || result.id} - ${result.customerName}`;
      const emailText = `
NEW B2C RETAIL ORDER RECEIVED
---------------------------------------
Order ID: #${result.id}
Tracking ID: ${result.trackid || "N/A"}
Customer Name: ${result.customerName}
Phone Number: ${result.phone}
Email: ${result.email || "N/A"}

Items:
${orderItems}

Subtotal: ₹${parseFloat(result.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Payment Method: ${result.paymentMethod === "cod" ? "Cash on Delivery (COD)" : "UPI Payment (Scanned QR)"}

Shipping Address:
${result.address}
${result.city}, ${result.state || ""} - ${result.pincode}
---------------------------------------
Date: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
      `;

      // Check if the email plugin service is available in this Strapi instance
      const emailService = (strapi as any)?.plugins?.['email']?.services?.email;
      if (emailService) {
        // Send email to info@bronkoe.in
        await emailService.send({
          to: "info@bronkoe.in",
          subject: emailSubject,
          text: emailText,
        });
        console.log(`[ORDER LIFECYCLE] Automatic order alert email sent successfully to info@bronkoe.in for Order #${result.id}`);
      } else {
        console.warn("[ORDER LIFECYCLE] Strapi Email service not found. Order details printed to logs:");
        console.log(`SUBJECT: ${emailSubject}`);
        console.log(emailText);
      }
    } catch (err) {
      console.error("[ORDER LIFECYCLE] Failed to execute background order email send:", err);
    }

    // 2. Send Automated WhatsApp Notification to the Customer using third-party gateway if API configured
    try {
      const whatsappApiKey = process.env.WHATSAPP_API_KEY;
      const whatsappInstanceId = process.env.WHATSAPP_INSTANCE_ID;
      const rawPhone = result.phone.replace(/[^\d]/g, ""); // Keep only digits

      if (whatsappApiKey && rawPhone) {
        const clientPhone = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;
        
        const payload = {
          token: whatsappApiKey,
          to: clientPhone,
          body: `Hi ${result.customerName},\n\nThank you for shopping with *Bronkoe Shoes*! We have received your order (Order ID: #${result.id}) for a total of ₹${parseFloat(result.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}.\n\nOur team is packing your items and will update you with shipping updates shortly.\n\nBest regards,\n*Bronkoe Support*`
        };

        const gatewayUrl = process.env.WHATSAPP_API_URL || `https://api.ultramsg.com/${whatsappInstanceId}/messages/chat`;
        
        const response = await fetch(gatewayUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log(`[ORDER LIFECYCLE] Automatic WhatsApp confirmation alert successfully dispatched to customer ${clientPhone}`);
        } else {
          console.warn(`[ORDER LIFECYCLE] WhatsApp gateway dispatch failed with status: ${response.status}`);
        }
      } else {
        console.log("[ORDER LIFECYCLE] WhatsApp API token not configured or customer phone invalid. WhatsApp notification skipped.");
      }
    } catch (err) {
      console.error("[ORDER LIFECYCLE] Automated WhatsApp confirmation error:", err);
    }
  }
};
