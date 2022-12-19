// importing users collection
const user = require(`../schemas/userSchema`);
// importing  dependencies
const bcrypt = require("bcrypt");
const jwt = require(`jsonwebtoken`);

const Login = async (req, res) => {
  try {
    const myPlaintextPassword = req.body.password;

    // hashing user password
    const hash = bcrypt.compare(myPlaintextPassword);
    const { username } = req.body;
    const document = await user.findOne({ password: hash, username: username });
    console.log(document);
    if (!document) {
      return res.status(404).json({ msg: `username or password is invalid` });
    }
    const token = jwt.sign({ username, password }, process.env.jwtSecret, {
      expiresIn: `30d`,
    });
    const response = await user
      .aggregate([
        {
          $match: {
            username: username,
            password: hash,
          },
        },
        {
          $lookup: {
            from: `beneficiaries`,
            localField: `userId`,
            foreignField: `userId`,
            as: `beneficiary`,
          },
        },
      ])
      .exec();
    console.log(response);
    response.forEach((each) => {
      delete each.sd;
    });
    res.status(200).json(response[0], token);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = Login;
