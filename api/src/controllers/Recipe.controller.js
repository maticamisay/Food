const axios = require('axios');
const { Recipe, Diet } = require('../db');

const allRecipes = async () => {

   const typeRecipes = (await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.API_KEY}&addRecipeInformation=true&number=10`)).data.results;
   const mapeoRecipes = typeRecipes.map((e) => ({
      id: e.id,
      name: e.title ? e.title : e.sourceName,
      steps: e.analyzedInstructions[0]?.steps.map(i => ({number: Number(i.number), step: i.step})), 
      summary: e.summary,
      healthScore: e.healthScore,
      diets: e.diets,
      image: e.image 
   }))
   // console.log(mapeoRecipes, 'idea del jesus')
   return mapeoRecipes;
}

const allDb = async () => {
   try {
      const db = await Recipe.findAll({
         include: { model: Diet, attributes: ["name"] }
      });
      const allData = db.map((e) => ({
         id: e.id,
         name: e.name,
         summary: e.summary,
         healthScore: e.healthScore,
         image: e.image,
         diets: e.diets.map((i) => i.name),
         steps: e.steps
      }));
      return allData;
   } catch (error) {
      console.log(error)
   }
}

//en esta funcion haciendo el contac puedo consumir datos de al api y db 
const getApiandDb = async (req, res) => {
   try {
      const allNameRecipe = await allRecipes();
      const allNameDb = await allDb();
      res.send([...allNameRecipe, ...allNameDb])
   } catch (error) {
      console.log(error)
   }
   // return getApiandDb;
}

//funcio  para encontrar por name la receta 
const getNames = async (req, res) => {
   try {
      let name = req.query.name;
      // console.log(name, 'soy el nombre de la api')
      let all = await allRecipes();
      let db = await allDb();
      let allAndDb = [...all, ...db].filter(e => e.name.toLowerCase().includes(name.toLowerCase()))
      res.send(allAndDb)
   } catch (error) {
      console.log(error);
   }
};

//funcion para encontrar por id la receta
const getId = async (req, res) => {
   try {
      let { id } = req.params
      if (/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(id)) {
         let recipesDB = await allDb()
         let allAndDb = recipesDB.find(e => e.id === id)
         console.log(allAndDb, 'hola soy los datos de la db')
         return res.send(allAndDb)
      } else {
         let recipesApi = await allRecipes()
         let allAndApi = recipesApi.find(e => e.id === Number(id))
         // console.log(allAndApi, 'soy el dato de la api')
         return res.send(allAndApi)
      }
   } catch (error) {
      console.log(error)
   }
};

//funcion para crear la receta desde el formulario .
const createRecipe = async (req, res) => {
   try {
      console.log(req.body)
      let { name, summary, healthScore, image, steps, diets } = req.body

      if (!name || !summary) return res.send('receta no creada');
      let newRecipe = await Recipe.create({ name, summary, healthScore, image, steps })

      let dietsPromise = diets.map(async (e) => await Diet.findOne({ where: { name: e } }))
      let dietsFinal = await Promise.all(dietsPromise)
      newRecipe.addDiet(dietsFinal)
      res.send(newRecipe)

   } catch (error) {
      console.log(error)
      res.send("no pudimos crear la receta")
   }
};

module.exports = {
   getApiandDb,
   getNames,
   getId,
   createRecipe,
}
