//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const { parseArgs } = require("util");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const day = date.getDate();
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Setting up Mongoose
mongoose.connect("mongodb+srv://admin-manish:test-123@cluster0.yebglx5.mongodb.net/test12");

//Creating Schema
const itemSchema = {
    item: String
};
const Item = mongoose.model('Item', itemSchema);


//Deafult Items
const item1 = new Item({
    item: "Good Morning"
})
const item2 = new Item({
    item: "my Name is Manish"
})
const item3 = new Item({
    item: "This is my todolist"
})
const defaultItem = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemSchema]
}
const List = mongoose.model('List', listSchema);

app.get("/", function (req, res) {
    Item.find({}, (err, foundItem) => {
        if (err) { console.log(err); }
        else {
            if (foundItem.length === 0) {
                Item.insertMany(defaultItem, (err) => {
                    if (err) { console.log(err); }
                    else { console.log("Succesfully Saved ") }
                    res.redirect("/");
                })
            } else {
                res.render("list", { listTitle: day, newListItems: foundItem });
            }
        }
    })
});

app.get("/:customListName", (req, res) => {
    let ListName = _.capitalize(req.params.customListName);
    List.findOne({ name: ListName }, (err, founditem) => {
        if (!err) {
            if (!founditem) {
                console.log(" Doesnt Exist : " + ListName);

                const list = new List({
                    name: ListName,
                    items: defaultItem
                })
                list.save();
                res.redirect('/' + ListName);
            } else {
                console.log(" Exist : " + ListName);
                res.render("list", { listTitle: founditem.name, newListItems: founditem.items });
            }
        }
    })

});

app.get("/about", function (req, res) {
    res.render("about");
});



app.post("/", function (req, res) {
    let newItem = req.body.newItem;
    let listTitle = req.body.list;
    const item4 = new Item({
        item: newItem
    });
    if (req.body.list === day) {
        item4.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listTitle }, (err, foundItem) => {
            foundItem.items.push(item4);
            foundItem.save();
            res.redirect("/" + listTitle);
        })
    }
});

app.post('/delete', (req, res) => {
    // console.log(req.body.checkbox);
    const checkedboxitem = req.body.checkbox;
    const listName = req.body.listName;
    if (listName === day) {
        Item.deleteOne({ _id: checkedboxitem }, (err) => {
            if (err) { console.log(err); }
            else {
                console.log("successfully Deleted");
                res.redirect("/");
            }
        });
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedboxitem } } }, (err, foundList) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
})

app.listen(3000, function () {
    console.log("Server started on port 3000");
});
