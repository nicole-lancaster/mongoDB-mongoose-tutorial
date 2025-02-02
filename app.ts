require("dotenv").config();
import mongoose from "mongoose";

type EnvVariables = {
  MONGO_URI: string;
};

type PersonType = {
  name: string;
  age?: number;
  favoriteFoods?: string[];
};

type DoneFunction = (
  arg0: mongoose.NativeError | null,
  arg1?: (PersonType & mongoose.Document<any, any, PersonType>) | undefined
) => void;

mongoose.connect((process.env as EnvVariables).MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let Person: mongoose.Model<PersonType, {}, {}>;

const personSchema = new mongoose.Schema<PersonType>({
  name: { type: String, required: true },
  age: Number,
  favoriteFoods: [String],
});

Person = mongoose.model<PersonType>("Person", personSchema);

const createAndSavePerson = (done: DoneFunction) => {
  let nicole = new Person({
    name: "Nicole",
    age: 99,
    favoriteFoods: ["pizza, BN biscuits"],
  });
  nicole.save((err, data) => {
    if (err) return done(err);
    return done(null, data);
  });
};

const createManyPeople = (arrayOfPeople: PersonType[], done: DoneFunction) => {
  Person.create(arrayOfPeople, (err, data) => {
    if (err) return done(err);
    return done(null, data);
  });
};

const findPeopleByName = async (personName, done) => {
  try {
    const data = await Person.find({ name: personName });
    return done(null, data);
  } catch (err) {
    if (err) return done(err);
  }
};

const findOneByFood = (food, done) => {
  Person.findOne({ favoriteFoods: food }, (err, data) => {
    if (err) return done(err);
    return done(null, data);
  });
};

const findPersonById = (personId, done) => {
  Person.findOne({ _id: personId }, (err, data) => {
    if (err) return done(err);
    return done(null, data);
  });
};

const findEditThenSave = (personId, done) => {
  const foodToAdd = "hamburger";
  Person.findOne({ _id: personId }, (err, person) => {
    if (err) return done(err);
    person.favoriteFoods.push(foodToAdd);
    person.save((err, updatedPerson) => {
      if (err) return done(err);
      return done(null, updatedPerson);
    });
  });
};

const findAndUpdate = (personName, done) => {
  const ageToSet = 20;

  Person.findOneAndUpdate(
    { name: personName },
    { age: ageToSet },
    { new: true },
    (err, person) => {
      if (err) return done(err);
      person.save((err, updatedPerson) => {
        if (err) return done(err);
        return done(null, updatedPerson);
      });
    }
  );
};

const removeById = async (personId, done) => {
  const deletedPerson = await Person.findByIdAndRemove(personId);
  if (err) return done(err);
  return done(null, deletedPerson);
};

const removeManyPeople = async (done) => {
  const nameToRemove = "Mary";
  const deletedPerson = await Person.deleteMany({ name: nameToRemove });
  return done(null, deletedPerson);
};

const queryChain = async (done) => {
  const foodToSearch = "burrito";
  const queryChain = await Person.find({ favoriteFoods: foodToSearch })
    .sort({ name: "asc" })
    .limit(2)
    .select("-age")
    .exec((err, person) => {
      if (err) return done(err);
      return done(null, person);
    });
};

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
