require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");

app.use(express.json());

app.use(
    cors({
        origin: [ "http://localhost:5173, http://localhost:5173/, http://127.0.0.1:5173, https://klusterthon.vercel.app"],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    })
)

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
app.get('/ping', (req, res) => {
    res.send('pong 🏓')
})

app.get('/', (req, res) => {
    res.send('stripe2 integrated')
})

app.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: req.body.items.map(item => {
                return {
                    price_data: {
                        currency: "ngn",
                        product_data: {
                            name: item.item
                        },
                        unit_amount: (item.price*100),
                    },
                    quantity: item.qty
                }
            }),
            success_url: 'https://klusterthon.vercel.app/invoices/success',
            cancel_url: 'https://klusterthon.vercel.app/invoices/cancel'
        })

        res.json({ url: session.url })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

const port = process.env.PORT || 5000


app.listen(port, (err, res) => {
    if (err) {
        console.log(err)
        return res.status(500).send(err.message)
    } else {
        console.log('[INFO] Server Running on port:', port)
    }
})