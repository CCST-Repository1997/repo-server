const multer = require('multer')
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./ManuscriptFiles");
    },
    filename: (req, file, callback) => {
        console.log(file)
        callback(null, `${new Date().getTime()}_${file.originalname}`)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpeg|jpg|png|pdf)$/)) {
            return callback(
                new Error(
                    'only upload files with jpg, jpeg, png, and pdf format.'
                )
            );
        }
        callback(null, true);
    }
});

module.exports = { upload };


