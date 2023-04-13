const express = require("express");
const cors = require("cors");
const app = express();
const client = require("./connection");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs")
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');


const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))


app.use(cors());
app.use(express.json());
const PORT = 5000;
app.listen(PORT, console.log(`Server is running at ${PORT}`));
// client.connect();

// const bodyParser = require("body-parser");
// app.use(bodyParser.json());


app.get("/products-back", (req, res) => {
  client.query("SELECT * FROM products", (error, results) => {
    if (error) throw error;
    res.send(results.rows);
  });
});

app.get("/api/salesss", (req, res) => {
  client.query("SELECT * FROM sales_info", (error, results) => {
    if (error) throw error;
    res.send(results.rows);
  });
});


app.get("/api/userinfo", (req, res) => {
  client.query("Select COUNT(*) from userinfo", (error, results) => {
    if (error) throw error;
    res.send(results.rows);
  });
});

app.get("/api/totalsold", (req, res) => {
  client.query("Select COUNT(*) from sales_info", (error, results) => {
    if (error) throw error;
    res.send(results.rows);
  });
});

app.get("/api/cartmai", (req, res) => {
  client.query("Select COUNT(*) from cart", (error, results) => {
    if (error) throw error;
    res.send(results.rows);
  });
});

app.get("/api/totalproduct", (req, res) => {
  client.query("Select COUNT(*) from products", (error, results) => {
    if (error) throw error;
    res.send(results.rows);
  });
});



app.get("/api/totalsales", (req, res) => {
  client.query("SELECT SUM( price_paid)  FROM sales_info", (error, results) => {
    if (error) throw error;
    res.send(results.rows);
  });
});



app.get("/api/sales", (req, res) => {
  client.query("SELECT p.*,s.* FROM products p join sales_info s on p.id=s.product_id ", (error, results) => {
    if (error) throw error;
    res.send(results.rows);
  });
});



app.get("/api/sales/:id", (req, res) => {
  client.query(`SELECT * from sales_info where user_id="${req.params.id}"`, (error, results) => {
    if (error) throw error;
    res.send(results.rows);
  });
});

app.get('/api/users/:userId/cart', (req, res) => {
  const { userId } = req.params
  client.query(`SELECT p.*, c.quantity FROM products p 
  JOIN cart c ON p.id = c.product_id 
  WHERE c.user_id = ${userId}`, (err, result) => {
      if (!err) {
        console.log("hello",result.rows)
          res.send(result.rows)
          
      }
  })
  client.end;
})



app.post('/api/users/:userId/cart/:productid', (req, res) => {
  const { userId,productid } = req.params
  const {quantity} = req.body
     
  client.query(`SELECT * FROM products WHERE id='${productid}'`,(error,results)=>{
    if(error){
      throw error;
    }else{
      if(results.rows[0].quantity>0){
        product_quantity = results.rows[0].quantity
        client.query(`SELECT * FROM cart WHERE product_id='${productid}' AND user_id='${userId}'; ` ,(error,results)=>{
          if(error){
            throw error;
          }else{
            if(results.rowCount>0){

              const newQunatity = results.rows[0].quantity + 1
              // const newAmount = (parseFloat(results.rows[0].amount) / results.rows[0].quantity)*newQunatity
              client.query(`UPDATE cart SET quantity=${newQunatity}  WHERE product_id='${productid}' AND user_id='${userId}'; `, (error,results)=>{
               if(error){
                 throw error;
               }
               else{
                 res.send('Added to cart successfully.')
               }
              })
            }else{
              client.query(`insert into cart (product_id,quantity,user_id) values (${productid},${quantity},${userId})`,  (error, result) => {
                if (error) {
                  throw error;
                }
                console.log(result.rows)
               res.send("Added to cart successfully.");
              
              });
            }

          }
        });
      }else{
        res.send("Product is not available at the moment.")
      }
      
   
     
    }
  })
  // client.query(`insert into cart (product_id,quantity,user_id) values (${productid},${quantity},${userId})`, (err, result) => {
  //    if (!err) {
  //         res.send("insersion was successfull")
  //     }
  // })
  client.end;
})






// app.post("/products-back", (req, res) => {
//   const user = req.body;
//   let insertQuery = `insert into products( name,price,description, imageurl,quantity) 
//                            values( '${user.name}', '${user.price}','${user.description}','${user.imageurl}','${user.quantity}')`;

//   client.query(insertQuery, (err, result) => {
//     if (!err) {
//       res.send("Insertion was successful");
//     } else {
//       console.log(err.message);
//     }
//   });
//   client.end;
// });


app.post('/login', (req, res)=>{
  const { email, password } = req.body
  console.log(email,password)
  client.query(`Select * from  userinfo where email='${email}' and pass='${password}'`, (err, result)=>{
      if(!err){
          res.send(result.rows);
          
      }
  });
  client.end;
})



app.post('/users', (req, res)=> {
  const user = req.body;

  client.query(`SELECT * FROM userinfo WHERE email='${user.email}'`, (err, result)=>{
      if(!err){
          if(result.rows[0]){
              return res.send('Email already in use')
          }
      }
  })
  client.end;

  let insertQuery = `INSERT INTO userinfo( fullname, email, pass,role) 
                     VALUES('${user.name}', '${user.email}', '${user.password}','${user.role}')`

  client.query(insertQuery, (err, result)=>
  {
      if(!err){
         return res.send('Insertion was successful')
      }
      else{ console.log(err.message) }
  })
  client.end;
})






// app.delete('/api/users/:userId/cart', (req, res) => {
//   const { userId,productid } = req.params
//   client.query(`delete from cart where user_id = ${userId} `, (err, result) => {
//       if (!err) {
//           res.send("deletion was successfull")
//       }
//   })
//   client.end;
// })



app.delete('/api/users/:userId/cart/:productid', (req, res) => {
  const { userId,productid } = req.params
  client.query(`delete from cart where user_id = ${userId} and product_id = ${productid}`, (err, result) => {
      if (!err) {
          res.send("deletion was successfull")
      }
  })
  client.end;
})


// 
app.post("/products-back", upload.array("images[]"), (req, res) => {
  const files = req.files;
  // console.log(files)
  const data = JSON.parse(req.body.product)
   
  const image_data = []
  for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageBuffer = fs.readFileSync(file.path);
      image_data.push(imageBuffer)
  }
  console.log(image_data);
  client.query(`insert into products(name, description, price, image, quantity) values ($1, $2, $3, $4 ,$5)`, [data.name, data.description, data.price, image_data , data.quantity], (err, result) => {
      if (!err) {
          res.status(200).send("Product submitted successfully");
      }
      // console.log(err);
  })
  client.end;
});


app.delete('/deleteproduct/:id', (req, res)=> {
  let insertQuery = `delete from products where id=${req.params.id}`

  client.query(insertQuery, (err, result)=>{
      if(!err){
          res.send('Deletion was successful')
      }
      else{ console.log(err.message) }
  })
  client.end;
})



app.get('/getproduct/:id', (req, res) => {
  client.query(`SELECT * FROM products where id=${req.params.id}`, (error, results, fields) => {
        if (error) throw error;
        res.send(results.rows);
      });
    });









    app.put('/api/products/:id', (req, res) => {
      const productId = req.params.id
      const updatedProduct = req.body
      console.log(updatedProduct)
    
      // Query the database to update the product by ID
      client.query(`UPDATE products SET name = '${updatedProduct.name}', price = '${updatedProduct.price}', description = '${updatedProduct.description}', quantity = '${updatedProduct.quantity}' WHERE id = '${productId}';`, (error, result) => {
        if (error) {
          console.log(error)
          return res.status(500).json({ error: 'Unable to update product' })
        }
    
        res.status(200).json({ message: 'Product updated successfully' })
      })
    })
    



    app.post('/sales/:id',(req,res)=>{


      const id = req.params.id
      const products = req.body
      let proceed = true
      for (let i = 0; i < products.length; i++) {
          let product = products[i]
          const sqlQuery = `SELECT quantity>${product.quantity} as availability FROM products WHERE id = '${product.id}'`
          client.query(sqlQuery, (err, result) => {
              if (!err) {
                  console.log(result.rows)
                  if (!result.rows[0].availability) {
                      proceed = false
                      return res.send(`${product.name} exceeds the maximum stock limit`)
                  }
              }
              else {
                  console.log(err.message)
              }
          })
          client.end
      }
      if (proceed) {
          console.log(products);
          let i;
          for (i = 0; i < products.length; i++) {
              let product = products[i]
              let sqlQuery = `INSERT INTO sales_info VALUES ('${product.id}', ${id}, 
              ${product.quantity}, ${parseFloat(product.price)})`
              client.query(sqlQuery, (err, result) => {
                  if (!err) {
                      console.log('bought', product.quantity, product.product_name)
                  }
                  else {
                      console.log(err.message);
                  }
              })
              client.end;
              sqlQuery = `UPDATE products SET quantity = quantity - ${product.quantity} WHERE id = '${product.id}'`
              client.query(sqlQuery, (err, result) => {
                  if (!err) {
                      console.log('updated stock for', product.name)
                  }
                  else {
                      console.log(err.message);
                  }
              })
          }
  //         if (i === products.length) {
  //             const sqlQuery = `DELETE FROM cart WHERE user_id = ${id}`
  //             client.query(sqlQuery, (err, result) => {
  //                 if (!err) {
  //                     return res.send('Transaction Complete')
  //                 }
  //                 else {
  //                     console.log(err.message);
  //                 }
  //             })
  
  //         }
      }
  
  
  
  



    })

    //mail
    app.post('/api/send-order-email', (req, res) => {
      // Extract order data from request body
      const { name, email, order_items } = req.body;
    
      // Create a Nodemailer transport object with SMTP settings
      const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use the email service of your choice
        auth: {
          user: 'siddhantjha12@gmail.com', // Replace with your email address
          pass: 'pugrndkpzwcdtkvh' // Replace with your email password
        }
      });
      let MailGenerator = new Mailgen({
        theme: "default",
        product : {
            name: "SHOP-US",
            link : 'https://shop_us.js/'
        }
    })
    
    let response = {
        body: {
            name : name,
            intro: `Your order is placed! ` ,
            table : {
                data : order_items
    },
            // order_date: order_date,
            // total_amount: total_amount,
            // payment_method: payment_method == "cod"? "Cash On Delivery" : "Via Debit/Credit Cart",
            
            outro: "Keep Shopping with us!"
        },
        
    }
    let mail = MailGenerator.generate(response)
      // Define email options
      const mailOptions = {
        from: 'siddhantjha12@gmail.com', // Replace with your email address
        to: email, // Recipient's email address
        subject: 'Order Confirmation', // Subject of the email
        html: mail// HTML content of the email
      };
    
      // Send the email using Nodemailer
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Failed to send email:', error);
          res.status(500).json({ message: 'Failed to send email' });
        } else {
          console.log('Email sent:', info.response);
          res.status(200).json({ message: 'Email sent successfully' });
        }
      });
    });