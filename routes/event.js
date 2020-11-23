const router = require("express").Router();
const db = require("../model/index");
const Moment = require("moment");
var nodemailer = require('nodemailer');
const parser = require("../cloudinary/cloudinary");
const cloudinary = require("cloudinary");

router.get("/event", function (req, res) {
    db.Events.find({}).then((response) => {
        console.log(response);
        console.log("showing events");
        if (response.length > 5) {
            let lastFive = response.slice(Math.max(response.length - 7, 1));
            res.json(lastFive);
        }
        else {
            res.json(response);
        }
    });
});

router.get("/event/:id", function (req, res) {
    let id = req.params.id
    db.Events.findById(id)
        .populate("attendees")
        .then((response) => {
            let timeToEvent = Moment(`${response.date} ${response.time}`).fromNow();
            res.json({ fromDB: response, time: timeToEvent });
        });
});


// create new event
router.post("/event", parser.single("image"), function (req, res) {
    console.log("event POST request received");
    let newEvent = {};
    let image = {};

    if (req.file) {
        image.url = req.file.url;
        image.id = req.file.public_id;
    } else {
        image = req.body.image;
    }

    newEvent.name = req.body.name;
    newEvent.address = req.body.address;
    newEvent.date = req.body.date;
    newEvent.time = req.body.time;
    newEvent.description = req.body.description
    newEvent.organizer = req.body.organizer;
    newEvent.image = image;

    db.Users.findOne({ username: newEvent.organizer })
        .then(response => newEvent.organizerId = response._id)
        .then(response => {
            db.Events.create(newEvent)
                .then((dbEvent) => {
                    res.json(dbEvent);
                    return db.Users.findByIdAndUpdate(
                        newEvent.organizerId,
                        { $push: { events: dbEvent._id } },
                        { new: true }
                    )
                })
                .catch(err => res.status(422).json(err))
        })
        .catch(err => console.log(err))

});

// update an existing event
router.put("/event/:id", parser.single("image"), function (req, res) {
    db.Events.findById(req.params.id)
        .then(event => {
            const id = event.image.id;
            let image = {};
            if (req.file) {
                console.log(req.file);
                image.url = req.file.url;
                image.id = req.file.public_id;
                if (id) {
                    cloudinary.v2.uploader.destroy(id, (err, res) => {
                        if (err) console.log(err);
                        console.log("This is the response:" + res)
                    });
                }
                
            } else {
                image = event.image;
                console.log(image);
            }
            db.Events.findByIdAndUpdate(event._id,
                {
                    $set: {
                        name: req.body.name,
                        address: req.body.address,
                        date: req.body.date,
                        time: req.body.time,
                        description: req.body.description,
                        image: image
                    }
                }, { new: true })
                .then(updatedEvent => {
                    res.json(updatedEvent)
                })
        })
        .catch(err => res.json(err));
});

// delete an existing event
router.delete("/event/:id", parser.single("image"), function (req, res) {
    let id = req.params.id;
    db.Events.findByIdAndDelete(id)
        .then(event => {
            cloudinary.v2.uploader.destroy(event.image.id, (err, res) => {
                if (err) console.log(err);
                console.log("This is the response:" + res);
            });
            db.Users.findByIdAndUpdate(req.body.userID,
                { $pullAll: { events: [id] } })
                .then(response => {
                    res.json(`${id} has been deleted`);
                })
        })
        .catch(err => res.status(422).json(err));
});


// add a user to an existing event
router.put("/signup/:id", function (req, res) {
    let id = req.params.id;
    console.log(`id for event is ${id}, userID is ${req.body.userID}`)
    db.Events.findByIdAndUpdate(id,
        {
            $addToSet: { attendees: req.body.userID }
        }).then(dbEvent => {
            return db.Users.findByIdAndUpdate(req.body.userID,
                { $addToSet: { events: id } },
                { new: true })
        })
        .then((response) => {
            res.json(response);
        }).catch(err => res.status(422).json(err));
});


router.get("/search", (req, res) => {
    const query = req.query.q;
    console.log("Query is " + query);
    db.Events.find({ $text: { $search: query } })
        .then(events => {
            if (events.length > 0) {
                if (events.length > 5) {
                    let lastFive = events.slice(Math.max(events.length - 7, 1));
                    res.json(lastFive);
                }
                else {
                    res.json(events);
                }
            } else {
                res.json("No events were found. Try another search.");
            }

        })
        .catch(err => res.status(422).json(err));
});

module.exports = router