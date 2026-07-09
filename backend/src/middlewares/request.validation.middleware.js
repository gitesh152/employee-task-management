/**
 * Middleware for validating requests
 */

const requestValidation = (schema) => async (req, _res, next) => {
  /** Validate request body, params, query, and cookies before the controller runs */
  try {
    const value = await schema.validateAsync(
      {
        body: req?.body || {},
        params: req?.params || {},
        query: req?.query || {},
        cookies: req?.cookies || {},
      },
      {
        allowUnknown: true,
        stripUnknown: true,
        abortEarly: false,
      },
    );

    const applyValidatedField = (field, data) => {
      if (data === undefined) {
        return;
      }

      Object.defineProperty(req, field, {
        value: data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    };

    applyValidatedField('body', value.body);
    applyValidatedField('params', value.params);
    applyValidatedField('query', value.query);
    applyValidatedField('cookies', value.cookies);

    next();
  } catch (error) {
    next(error);
  }
};

export default requestValidation;
