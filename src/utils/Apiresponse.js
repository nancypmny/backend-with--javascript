class Apiresponse{
    constructor(
        statusCode,
        message="Success",
        data
    ){
        this.data=data,
        this.statusCode=statusCode,
        this.message=message,
        this.success = statusCode < 400
    }
}

export {Apiresponse}