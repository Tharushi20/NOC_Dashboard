export default function generateHtml(data) {
    const { machine_ip, error_description, machine_location } = data;
    const description = (error_description || '').replace(/\n/g, '<br>');
  
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #ffffffff, #ff0000ff); padding: 20px; display: flex; align-items: center; border-bottom: 1px solid #e9ecef; }
            .header .logo { flex: 0 0 auto; margin: 0 20px; }
            .header .logo img { max-width: 120px; height: auto; display: block; }
            .header .header-content { flex: 1; color: #ffffff; margin-right: 20px; }
            .header h1 { font-size: 24px; margin: 0; font-weight: 600; }
            .header p { font-size: 16px; margin: 5px 0 0; opacity: 0.9; }
            .content { padding: 20px 30px; }
            .section { margin-bottom: 20px; }
            .section h2 { font-size: 18px; color: #007bff; margin: 0 0 10px; border-bottom: 2px solid #e9ecef; padding-bottom: 5px; }
            .info-row { display: flex; align-items: flex-start; margin-bottom: 12px; font-size: 14px; }
            .info-row label { font-weight: 600; color: #495057; width: 120px; min-width: 120px; margin-right: 15px; }
            .info-row span { color: #212529; flex: 1; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef; }
            @media (max-width: 600px) { .container { margin: 10px; } .header { flex-direction: column; text-align: center; } .header .logo { margin: 0 0 15px 0; } .header .header-content { margin-right: 0; } .info-row { flex-direction: column; } .info-row label { width: auto; margin-bottom: 5px; margin-right: 0; } }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <img src="https://i.imgur.com/wK7GbuP.png" alt="NOC Logo" style="max-width: 120px; height: auto;">
                </div>
                <div class="header-content">
                    <h1 style="color: black;">Network Operation Center</h1>
                    <p style="color: red; font-weight: bold;">Alert Detected!</p>
                </div>
            </div>
            <div class="content">
                <div class="section">
                    <h2>Machine Information</h2>
                    <div class="info-row"><label>Machine IP:</label><span>${machine_ip || 'N/A'}</span></div>
                    <div class="info-row"><label>Error Description:</label><span>${description || 'N/A'}</span></div>
                    <div class="info-row"><label>Machine Location:</label><span>${machine_location || 'N/A'}</span></div>
                </div>
            </div>
            <div class="footer">
                <p>This message was sent by the FIT NOC team.</p>
                <p>Monitoring System - Confidential</p>
            </div>
        </div>
    </body>
    </html>
    `;
}