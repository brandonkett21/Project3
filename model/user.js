var mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var UsersSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

    firstname: {
        type: String,
        required: true,
    },

    lastname: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    image: {
        url: {
            type: String,
            required: false,
            default: "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
        },
        id: {
            type: String,
            required: false
        }
    },

    events: [{
        type: Schema.Types.ObjectId,
        ref: "Events"
    }]


});

UsersSchema.pre('save', function (next) {
    if (!this.password) {
        console.log('models/user.js =======NO PASSWORD PROVIDED=======')
        next()
    } else {
        console.log('models/user.js hashPassword in pre save');
        this.password = this.hashPassword(this.password)
        next()
    }
})

UsersSchema.methods = {
    checkPassword: function (inputPassword) {
        return bcrypt.compareSync(inputPassword, this.password)
    },
    hashPassword: plainTextPassword => {
        return bcrypt.hashSync(plainTextPassword, 10)
    }
}

var Users = mongoose.model("Users", UsersSchema);

module.exports = Users;