import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const sendRecieptWhatsapp = async (
  phone,
  filePath,
  donorName,
  amount,
) => {
  try {
    const form = new FormData();

    form.append("token", process.env.FLAXXA_TOKEN);
    form.append("phone", phone);
    form.append("template_name", "thank_you_page");
    form.append("template_language", "en_GB");

    form.append(
      "components",
      JSON.stringify([
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: donorName,
            },
            {
              type: "text",
              text: String(amount),
            },
          ],
        },
      ]),
    );

    form.append("header_attachment", fs.createReadStream(filePath), {
      filename: "Donation_Receipt.pdf",
      contentType: "application/pdf",
    });

    const response = await axios.post(
      "https://wapi.flaxxa.com/api/v1/sendtemplatemessage_withattachment",
      form,
      {
        headers: form.getHeaders(),
      },
    );

    console.log("WhatsApp sent:", response.data);

    return response.data;
  } catch (error) {
    console.error("WhatsApp Error:", error.response?.data || error.message);
  }
};
