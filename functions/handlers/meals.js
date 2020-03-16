const { db } = require(`../utils/admin`)

exports.getAllMeals = (req, res) => {
  db.collection('meals').get()
    .then(data => {
      let meals = [];
      data.forEach(doc => {
        meals.push({
          mealId: doc.id,
          name: doc.data().name,
          menu: doc.data().menu,
          dayOfWeek: doc.data().dayOfWeek,
          description: doc.data().description,
          cost: doc.data().cost,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(meals);
    })
    .catch(err => console.error(err))
}

exports.postOneMeal = (req, res) => {
  const newMeal = {
    cost: req.body.cost,
    name: req.body.name,
    menu: req.body.menu,
    dayOfWeek: req.body.dayOfWeek,
    description: req.body.description,
    createdAt: new Date().toISOString()
  };

  db.collection('meals')
    .add(newMeal)
    .then(doc => {
      return res.json({ message: `document ${doc.id} created successfully` })
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err)
    })
}