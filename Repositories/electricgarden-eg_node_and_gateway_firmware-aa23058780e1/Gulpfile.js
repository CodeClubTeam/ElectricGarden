import gulp from 'gulp'
import deployConfig from './deploy.config'
import msRestAzure from 'ms-rest-azure'
import {default as frontend} from './webportal/frontend/Gulpfile'

var deviceTokenCredentialsAuthed = null;

gulp.task('build-static-site', () => {
    
});

gulp.task('azure-credentials', () => {
    return msRestAzure.interactiveLogin()
    .then((credentials) => {
        deviceTokenCredentialsAuthed=credentials
        console.log(`Authenticated as ${credentials.username}`);
    });
});

