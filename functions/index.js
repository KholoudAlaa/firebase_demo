const functions = require("firebase-functions");
const admin = require("firebase-admin");
//declare  express
const app = require("express")();

admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyAWC09Yh86rUyRjzcP1wyUir4_Uqi7RvsI",
  authDomain: "codinga-d878d.firebaseapp.com",
  databaseURL: "https://codinga-d878d.firebaseio.com",
  projectId: "codinga-d878d",
  storageBucket: "codinga-d878d.appspot.com",
  messagingSenderId: "1023904335805",
  appId: "1:1023904335805:web:007b32dae8d439bf"
};

//declare firebase config
const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// app.get('/Users',(req , res )=>{
//     db
//     .collection('Users')
//     .orderBy('createdAt','desc')
//     .get()
//     .then(data =>{
//         let users = [];
//         data.forEach(doc =>{
//             users.push({
//                 Id:doc.id,
//                 // body:doc.data().body,
//                 // createdAt:doc.data().createdAt
//                  ...doc.data()
//             });
//         });
//        return res.json(users)
//     })
//     .catch(err => console.error(err))
// })

// app.post('/PostUsers',(req , res)=>{
//     const newUsertest = {
//         UserId:req.body.UserId,
//         body:req.body.body,
//         createdAt:new Date().toISOString()
//     };

//          db
//          .collection('Users')
//          .add(newUsertest)
//          .then(doc =>{
//              res.json({message: `document ${doc.id} created Successfully`});
//          })

//          .catch((err)=>{
//           res.status(500).json({error : 'something went wrong'});
//           console.error(err)
//      });
// })

// const isEmail = ()=>{

// }

//getList
app.get("/getList", (req, res) => {
  var user = firebase.auth().currentUser;
  if (user) {
    // User is signed in.
    var userID = user.uid;
    db.collection("ToDoList").orderBy('createdAt','desc').get()
      .then(data => {
        let items = [];
        data.forEach(doc => {
          var item = {
            Id: doc.id,
            ...doc.data()
          };
          if (item.userID == userID) items.push(item);
        });
        return res.json(items);
      })
      .catch(err => console.error(err));
  } else {
    res.status(401).json({ error: "UnAuthorize" });
    console.error(err);
  }
});

//add ToDoList
app.post("/addList", (req, res) => {
  var user = firebase.auth().currentUser;
  if (user) {
    const newList = {
      title: req.body.title,
      content: req.body.content,
      userID: user.uid,
      createdAt: new Date().toISOString()
    };

    db.collection("ToDoList")
      .add(newList)
      .then(doc => {
        res.json({  message: `document ${doc.id} created Successfully` });
      })

      .catch(err => {
        res.status(500).json({ error: "something went wrong" });
        console.error(err);
      });
  } else {
    res.status(401).json({ error: "UnAuthorize" });
    console.error(err);
  }
});

//edit ToDoList
app.post("/EditList", (req, res) => {
    var user = firebase.auth().currentUser;
    if (user) {
      const updatedItem = {
        title: req.body.title,
        content: req.body.content,
        userID: user.uid,
      };

      db.doc(`/ToDoList/${req.body.Id}`).update(updatedItem)
      .then(result =>{ res.json({ message: `document ${updatedItem.Id} Updated Successfully` });}).catch(err => {
          res.status(500).json({ error: "Error Occurs while Update item " });
          console.error(err);
        });

      docRef = db.doc(`/ToDoList/${req.body.id}`);

    //   docRef.get().then(function(doc) {
    //     if (doc && doc.userID == user.uid) {
         
            
    //     }
    //     else{
    //         res.status(500).json({ error: "Document not Found" });
    //     }
       
    // }).catch(function(error) {
    //     res.status(500).json({ error: "Error Occurs while reterive file " });
    // });

      
     
    } else {
      res.status(401).json({ error: "UnAuthorize" });
      console.error(err);
    }
  });

  //delete list
  app.post("/DeleteList", (req, res) => {
    var user = firebase.auth().currentUser;
    if (user) {

        db.doc(`/ToDoList/${req.body.Id}`).delete()
        .then(result =>{ res.json({ message: `document ${req.body.Id} Deleted Successfully` });}).catch(err => {
            res.status(500).json({ error: "something went wrong while delete file" });
            console.error(err);
          });   

       // docRef = db.doc(`/ToDoList/${req.body.Id}`);

        //     docRef.get().then(function(doc) {
        //       if (doc && doc.userID == user.uid) {
            
        //       } 
        //       else{
        //         res.status(500).json({ error: "Document not Found", doc : "test" });
                
        //     }
        //     }).catch(function(error) {
        //     res.status(500).json({ error: "Error Occurs while reterive file " });
        // });

    
    } else {
      res.status(401).json({ error: "UnAuthorize" });
      console.error(err);
    }
  });


//Signup Route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  };

  //Validate data
  let token, UserId;
  db.doc(`/Users/${newUser.email}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ responseCode: 110, Message: "Email is Already Taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })

    .then(data => {
      UserId = data.user.uid;
      return data.user.getIdToken();
    })

    .then(idToken => {
      token = idToken;
      const userCredentials = {
        email: newUser.email,
        createdAt: new Date().toISOString(),
        UserId
      };
      return db.doc(`/Users/${newUser.email}`).set(userCredentials);
    })

    .then(() => {
      return res.status(201).json({ token });
    })

    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res
          .status(400)
          .json({ responseCode: 110, Message: "Email is Already Taken" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

//login Route
app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        responseCode: 113,
        Message: "Wrong credentials, please try again"
      });
    });
});

exports.api = functions.https.onRequest(app);
