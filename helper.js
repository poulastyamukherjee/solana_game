function getReturnAmount(investment, stakeFactor) {
    try{
        return investment*stakeFactor;
    }catch(err){
        console.log(err);
    }
}

function totalAmtToBePaid(investment) {
    try{
        return investment;
    }catch(err){
        console.log(err);
    }
}

function randomNumber(min, max) {
    try{
        return Math.floor(Math.random * (max - min + 1)) + min;
    }catch(err){
        console.log(err);
    }
}

module.exports={randomNumber, totalAmtToBePaid, getReturnAmount};