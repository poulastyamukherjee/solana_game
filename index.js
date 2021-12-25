const {inquirer} = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const { Keypair } = require('@solana/web3.js');

const {getWalletBalance,transferSOL,airDropSol}=require("./solana");
const { getReturnAmount, totalAmtToBePaid, randomNumber } = require('./helper');

const init = () => {
    console.log(
        chalk.green(
        figlet.textSync("SOL Stake", {
            font: "Standard",
            horizontalLayout: "default",
            verticalLayout: "default"
        })
        )
    );
    console.log(chalk.yellow`The max bidding amount is 2.5 SOL here`);
};


const connection=new web3.Connection(web3.clusterApiUrl("devnet"),"confirmed");

// User wallet
const userSecretKey = [
    56, 236,  27, 104, 230,  60, 187, 194, 116, 166,  64,
   253, 131,  43,  68, 251, 141, 117,   9, 240,   4, 250,
   203, 238, 222,  83, 152,  56, 147,  40, 158, 230, 204,
    16, 208, 135,  47, 247, 143, 249,  16,  92,  35, 182,
    77, 108, 111,  88, 199,  62,  46, 108,  42,  20, 219,
    98,  53, 133, 148,  29,  62,  14, 118,  47
 ]
const userWallet=web3.Keypair.fromSecretKey(Uint8Array.from(userSecretKey));

// Treasury Wallet
const treasurySecretKey = [
    113, 133, 180,  59, 192, 158, 162,  79, 189,  50,  58,
    244, 153, 132, 250, 188,  43, 100,  25, 126,  95, 228,
    216, 173,  18, 103,  77, 101,  69, 161, 204,  61, 206,
    131, 241, 111,  82, 246,  34,  10, 146, 254, 190,  31,
      7,  29, 157,  29,  96,  55, 130, 183, 152,  76, 241,
    204, 204, 120,  94, 157, 210,  40, 185, 125
  ]
const treasuryWallet=web3.Keypair.fromSecretKey(Uint8Array.from(treasurySecretKey));

const askQuestions = () => {
    const questions = [
        {
            name: "SOL",
            type: "number",
            message: "How much SOL you want to stake?",
        },
        {
            type: "rawlist",
            name: "RATIO",
            message: "What is the staking ratio?",
            choices: ["1:1.25", "1:1.5", "1:1.75", "1:2"],
            filter: function(val) {
                const stakeFactor=val.split(":")[1];
                return stakeFactor;
            },
        },
        {
            type:"number",
            name:"RANDOM",
            message:"Guess a random number from 1 to 5 (both 1, 5 included)",
            when:async (val)=>{
                if(parseFloat(totalAmtToBePaid(val.SOL))>5){
                    console.log(chalk.red`Stake Limit Exceeded. Stake with smaller amount.`)
                    return false;
                }else{
                    console.log(`Outstanding Amount ${chalk.green`${totalAmtToBePaid(val.SOL)}`} to be paid`)
                    const userBalance=await getWalletBalance(userWallet.publicKey.toString())
                    if(userBalance<totalAmtToBePaid(val.SOL)){
                        console.log(chalk.red`You don't have enough balance in your wallet`);
                        return false;
                    }else{
                        console.log(chalk.orange`You will get ${getReturnAmount(val.SOL,parseFloat(val.RATIO))} if guessing the number correctly`)
                        return true;    
                    }
                }
            },
        }
    ];
    return inquirer.prompt(questions);
};

const gameExecution=async ()=>{
    init();
    const generateRandomNumber=randomNumber(1,5);
    const answers=await askQuestions();
    if(answers.RANDOM){
        const paymentSignature=await transferSOL(userWallet,treasuryWallet,totalAmtToBePaid(answers.SOL))
        console.log(`Signature of payment for playing the game`,chalk.green`${paymentSignature}`);
        if(answers.RANDOM===generateRandomNumber){
            await airDropSol(treasuryWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)));

            const prizeSignature=await transferSOL(treasuryWallet,userWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)))
            console.log(chalk.blue`Correct Guess!`);
            console.log(`Here is the price signature `,chalk.blue`${prizeSignature}`);
        }else{
            //better luck next time
            console.log(chalk.red`Better luck next time`)
        }
    }
}

gameExecution()