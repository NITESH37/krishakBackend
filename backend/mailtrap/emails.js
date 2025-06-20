import { mailtrapClient, sender } from "./mailtrap.config.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"

//send verification email
export const sendVerification = async (verificationToken, email) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "verify your email!",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "email verification"
        })
        console.log("email sent successfully!");
    } catch (error) {
        console.log(`error in sending verification email ${error}`)
        throw new Error(`error in sending email: ${error}`)
    }
}

//send welcome email
export const sendWelcomeEmail = async (name, email) => {

    const recipient = [{ email }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "9674e6b3-dffd-406b-b496-fef7f3ec0aff",
            template_variables: {
                "company_info_name": "Test_Company_info_name",
                "name": "Satyam company"
            }
        })
        console.log("Welcome email sent successfully!")
    } catch (error) {
        console.log("error in sending welcome email: ", error);
        throw new Error("Error in sending welcome email!", error)
    }
}

//send reset email
export const sendResetEmail = async (email, resetUrl) => {
    const client = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: client,
            subject: "Reset Your password!",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
            category: "Password Reset"
        })
    } catch (error) {
        console.log("error in sending Reset Mail!", error);
        throw new Error("error in sending reset mail!")
    }
}

//send reset success email
export const sendResetSuccessEmail = async (email) => {
    const recipient  = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from:sender ,
            to: recipient ,
            subject: "password Reset Successfull!",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category:"Password Reset"
        })
        console.log("success !")

    } catch (error) {
        console.log("error in sending resetsuccess email!", error);
        throw new Error("error in sending resetPassword mail");
    }
}