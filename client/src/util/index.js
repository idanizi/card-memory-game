export function getFunctionName() {
    try {
        return getFunctionName.caller.name;
    }

    catch (error) {
        console.log(error.message)
    }
}

export function delay(timeout) {
    return new Promise(resolve => setTimeout(() => {
        resolve()
    }, timeout))
}