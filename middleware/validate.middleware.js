import { validationResult } from "express-validator";

const validate = (validations) => {

    return async(req, res, next) => {

        // ========================================
        // RUN VALIDATIONS
        // ========================================

        for (const validation of validations) {
            await validation.run(req);
        }


        // ========================================
        // GET VALIDATION ERRORS
        // ========================================

        const errors =
            validationResult(req);


        if (!errors.isEmpty()) {

            return res.status(400).json({

                success: false,

                message: "Validation failed",

                errors: errors.array().map((error) => ({

                    field: error.path,

                    message: error.msg

                }))

            });
        }


        // ========================================
        // NEXT
        // ========================================

        next();
    };
};


export default validate;