import { MailData } from '../types';

export function generateTextEmail(mailData: MailData, link: string, network: string) {
    return `We just detected an update of the event "${mailData.eventData.event}" from the contract "${mailData.eventSubscription.contract}" on the network "${network}". View more info on ${link}`;
}

export default function generateEmail(mailData: MailData, link: string, network: string) {
    return `
    <!doctype html>
    <!-- 
      Email template by leemunroe:
      https://github.com/leemunroe/responsive-html-email-template
    -->
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Unified Auctions UI - Notification Service Alert</title>
      <style>
        @media only screen and (max-width: 620px) {
          table.body h1 {
            font-size: 28px !important;
            margin-bottom: 10px !important;
          }
        
          table.body p,
          table.body ul,
          table.body ol,
          table.body td,
          table.body span,
          table.body a {
              font-size: 16px !important;
            }
          
            table.body .wrapper,
          table.body .article {
              padding: 10px !important;
            }
          
            table.body .content {
              padding: 0 !important;
            }
          
            table.body .container {
              padding: 0 !important;
              width: 100% !important;
            }
          
            table.body .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important;
            }
          
            table.body .btn table {
              width: 100% !important;
            }
          
            table.body .btn a {
              width: 100% !important;
            }
          
            table.body .img-responsive {
              height: auto !important;
              max-width: 100% !important;
              width: auto !important;
            }
          }
          @media all {
            .ExternalClass {
              width: 100%;
            }
          
            .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
              line-height: 100%;
            }
          
            .apple-link a {
              color: inherit !important;
              font-family: inherit !important;
              font-size: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
              text-decoration: none !important;
            }
          
            #MessageViewBody a {
              color: inherit;
              text-decoration: none;
              font-size: inherit;
              font-family: inherit;
              font-weight: inherit;
              line-height: inherit;
            }
          
            .btn-primary table td:hover {
              background-color: #34495e !important;
            }
          
            .btn-primary a:hover {
              background-color: #34495e !important;
              border-color: #34495e !important;
            }
          }
    </style>
    </head>
    <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
        <tr>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
            <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
  
              <!-- START CENTERED WHITE CONTAINER -->
              <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
  
                <!-- START MAIN CONTENT AREA -->
                <tr>
                  <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                      <tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello,</p>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                             We just detected an update of the event <b>"${mailData.eventData.event}"</b> of the contract "${mailData.eventSubscription.contract}" on the network "${network}".
                          </p>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: bold; margin: 0; margin-bottom: 5px; color: #3498db">
                             Updated Data:
                          </p>
                          <p style="font-family: monospace; font-size: 14px; font-weight: normal; margin: 0 0 15px; background-color: #2e3338; color: white; padding: 10px; border-radius: 10px; max-width: 580px; overflow: auto">
                             ${mailData.formattedData}
                          </p>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                            <tbody>
                              <tr>
                                <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                    <tbody>
                                      <tr>
                                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #3498db;" valign="top" align="center" bgcolor="#3498db"> 
                                          <a href="${link}" target="_blank" style="border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #3498db; border-color: #3498db; color: #ffffff;">
                                            View Event on Etherscan
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">
                             You are currently subscribed to receive updates when this event is triggered. 
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
  
              <!-- END MAIN CONTENT AREA -->
              </table>
              <!-- END CENTERED WHITE CONTAINER -->
  
              <!-- START FOOTER -->
              <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                  <tr>
                    <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                      Powered by <a href="https://github.com/sidestream-tech/unified-auctions-ui" style="color: #999999; font-size: 12px; text-align: center; text-decoration: none;">Unified Auctions UI</a>.
                    </td>
                  </tr>
                </table>
              </div>
              <!-- END FOOTER -->
  
            </div>
          </td>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
