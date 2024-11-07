export class DataService {
    protected id:string;
    protected title:{
        [lang:string]:string
    }
    protected endpointURL:string;
    // pointer to statistics file
    protected extent?:string;
    
    constructor(obj: any) {
        this.id = obj.id;
        this.endpointURL = obj.endpointURL;
        this.title = obj.title;
        this.extent = obj.extent;
    }

    public getEndpointURL():string {
        return this.endpointURL;
    }

    public getTitle(lang:string):string {
        if(this.title[lang]) { 
            return this.title[lang];
        } else {
            return "no title in "+lang;
        }
    }

    public getId():string {
        return this.id;
    }

    public getExtent():string {
        return this.extent;
    }
}