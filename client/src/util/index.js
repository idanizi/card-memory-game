export function getFunctionName(){
    try{
       return getFunctionName.caller.name;
    }

    catch (error) {
        console.log(error.message)
    }
}