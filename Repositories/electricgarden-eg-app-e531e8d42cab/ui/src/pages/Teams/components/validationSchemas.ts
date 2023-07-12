import * as yup from 'yup';

export const teamValidationSchema = yup.object().shape({
    name: yup.string().required('Please enter a name for this team.'),
    leaders: yup.array(yup.string()),
    members: yup.array(yup.string()),
});
