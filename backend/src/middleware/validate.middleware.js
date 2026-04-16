export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,     // saari errors ek saath
            stripUnknown: true,    // extra fields remove
        });

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map((err) => err.message),
            });
        }

        req.body = value; // cleaned & validated data

        next();
    };
};