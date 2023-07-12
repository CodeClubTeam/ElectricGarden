import * as yup from 'yup';

export const validateAndReturnTyped = <TSchema extends yup.ObjectSchema<any>>(
  schema: TSchema,
) => ({
  validateSync: (obj: unknown) => {
    schema.validateSync(obj);
    return obj as yup.InferType<TSchema>;
  },
  validate: async (obj: unknown) => {
    await schema.validate(obj);
    return obj as yup.InferType<TSchema>;
  },
});
