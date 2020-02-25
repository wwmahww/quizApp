exports.getIntroduction = (req, res, next) => {
  res.status(200).render('intro', {
    title: 'quizApp'
  });
};

exports.signIn = (req, res, next) => {
  res.status(200).render('signIn');
};
exports.signUp = (req, res, next) => {
  res.status(200).render('signUp');
};

exports.myProfile = (req, res, next) => {
  res.status(200).render('MyProfile');
};
