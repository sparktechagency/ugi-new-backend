import { sendEmail } from './mailSender';


interface OtpSendEmailParams {
  sentTo: string;
  subject: string;
  name: string;
  otp: string | number;
  expiredAt: string;
}

// const otpSendEmail = async ({
//   sentTo,
//   subject,
//   name,
//   otp,
//   expiredAt,
// }: OtpSendEmailParams): Promise<void> => {
//   // console.log({ sentTo , otp});
//   await sendEmail(
//     sentTo,
//     subject,
//     `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//        <h1>Hello dear, ${name}</h1>
//       <h2 style="color: #4CAF50;">Your One Time OTP</h2>
//       <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
//         <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
//         <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiredAt.toLocaleString()}</p>
//       </div>
//     </div>`,
//   );
// };

const otpSendEmail = async ({
  sentTo,
  subject,
  name,
  otp,
  expiredAt,
}: OtpSendEmailParams): Promise<void> => {
  await sendEmail(
    sentTo,
    subject,
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="font-size: 22px;">Hey ${name},</h1>

      <p style="font-size: 16px; line-height: 1.5;">
        Welcome to <strong>Uogi</strong>! To keep your account safe, we need to verify your details.
      </p>

      <h2 style="font-size: 18px; margin-top: 20px;">Here's your One Time Password (OTP): ${otp}</h2>

      
      <p style="font-size: 16px; line-height: 1.5;">
        Please enter this OTP within 3 minutes to complete your verification.
      </p>

      <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">
        We are excited for you to explore all the amazing features we have for you! 
      </p>

      <p style="margin-top: 30px; font-size: 15px; color: #666;">
        From the Uogi Team
      </p>

      <img src="https://i.ibb.co.com/C36S8Tft/Uogi-logo.png" alt="Uogi Logo" style="max-width: 100px;">

    </div>
    `,
  );
};


export { otpSendEmail };
