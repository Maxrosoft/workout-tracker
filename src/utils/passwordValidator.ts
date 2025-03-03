import PasswordValidator from "password-validator";

const passwordValidator = new PasswordValidator();
passwordValidator
    .is()
    .min(8)
    .is()
    .max(100)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits()
    .has()
    .not()
    .spaces();

export default passwordValidator;
