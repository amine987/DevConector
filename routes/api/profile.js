const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//Load Profile module
const Profile = require("../../models/Profile");

//Load User Profile
const User = require("../../models/User");

//@route  GET api/profile/test
//@desc   Tests profile route
//@access Public
router.get("/test", (req, res) => {
  res.json({
    msg: "profile work",
  });
});

//@route  GET api/profile
//@desc   Get current users profile
//@access Private
router.get(
  "/",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const errors = {};

    Profile.findOne({
        user: req.user.id,
      })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route  POST api/profile/user/:user_id
//@desc   Get profile by user id
//@access Public
router.get("/user/:user_id", (req, res) => {
  Profile.findOne({
      user: req.params.user_id,
    })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile";
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({
        profile: "there is no profile for this user",
      })
    );
});

//@route  GET api/profile/all
//@desc   Get all profiles
//@access Public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        res.status(400).json(errors);
      }
      res.json(profiles);
    })
    .catch(err =>
      res.status(404).json({
        profile: "there are no profiles here",
      })
    );
});

//@route  GET api/profile/handle/:handle
//@desc   Get profile by handle
//@access Public
router.get("/handle/:handle", (req, res) => {
  Profile.findOne({
      handle: req.params.handle,
    })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile";
        res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({
        profile: "there is no profile for this handle",
      })
    );
});

//@route  POST api/profile
//@desc   Create or edit user profile
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const {
      errors,
      isValid
    } = validateProfileInput(req.body);

    //check Validation
    if (!isValid) {
      res.status(400).json(errors);
    }

    //Get fields
    const profilefields = {};

    profilefields.user = req.user.id;
    if (req.body.handle) profilefields.handle = req.body.handle;
    if (req.body.company) profilefields.company = req.body.company;
    if (req.body.website) profilefields.website = req.body.website;
    if (req.body.location) profilefields.location = req.body.location;
    if (req.body.bio) profilefields.bio = req.body.bio;
    if (req.body.status) profilefields.status = req.body.status;
    if (req.body.githubusername)
      profilefields.githubusername = req.body.githubusername;

    //skills split into array
    if (typeof req.body.skills !== "undefined") {
      profilefields.skills = req.body.skills.split(",");
    }

    //social
    profilefields.social = {};
    if (req.body.youtube) profilefields.social.youtube = req.body.youtube;
    if (req.body.twitter) profilefields.social.twitter = req.body.twitter;
    if (req.body.facebook) profilefields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profilefields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profilefields.social.instagram = req.body.instagram;

    Profile.findOne({
      user: req.user.id,
    }).then(profile => {
      if (profile) {
        //update
        Profile.findOneAndUpdate({
          user: req.user.id,
        }, {
          $set: profilefields,
        }, {
          new: true,
        }).then(profile => res.json(profile));
      } else {
        //create

        //check if handle exists
        Profile.findOne({
          handle: profilefields.handle,
        }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          //save profile
          new Profile(profilefields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

//@route  POST api/profile/experience
//@desc   Add experience to profile
//@access Private
router.post(
  "/experience",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const {
      errors,
      isValid
    } = validateExperienceInput(req.body);

    //check Validation
    if (!isValid) {
      res.status(400).json(errors);
    }

    Profile.findOne({
        user: req.user.id,
      })
      .then(profile => {
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description,
        };

        //Add to exp array
        profile.experience.unshift(newExp);

        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res.status(400).json({
          error: "there is an error",
        })
      );
  }
);

//@route  POST api/profile/education
//@desc   Add education to profile
//@access Private
router.post(
  "/education",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    const {
      errors,
      isValid
    } = validateEducationInput(req.body);

    //check Validation
    if (!isValid) {
      res.status(400).json(errors);
    }

    Profile.findOne({
        user: req.user.id,
      })
      .then(profile => {
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          fieldofstudy: req.body.fieldofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description,
        };

        //Add to exp array
        profile.education.unshift(newEdu);

        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res.status(400).json({
          error: "there is an error",
        })
      );
  }
);

//@route  DELETE api/profile/experience
//@desc   Delete experience form
//@access Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    Profile.findOne({
        user: req.user.id,
      })
      .then(profile => {
        //Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        //Splice out of array
        profile.experience.splice(removeIndex, 1);

        //save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res.status(400).json({
          error: "there is an error",
        })
      );
  }
);

//@route  DELETE api/profile/education
//@desc   Delete education form
//@access Private
router.delete(
  '/education/:educ_id',
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    Profile.findOne({
        user: req.user.id,
      })
      .then(profile => {
        //Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.educ_id);

        //Splice out of array
        profile.education.splice(removeIndex, 1);

        //save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res.status(400).json({
          error: "there is an error",
        })
      );
  }
);

//@route  DELETE api/profile
//@desc   Delete user and profile
//@access Private
router.delete(
  '/',
  passport.authenticate("jwt", {
    session: false,
  }),
  (req, res) => {
    Profile.findOneAndRemove({
      user: req.user.id
    }).then(() => {
      User.findOneAndRemove({
        _id: req.user.id
      }).then(() => {
        res.json({
          success: true
        });
      })
    });
  });


module.exports = router;