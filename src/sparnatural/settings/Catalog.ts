import { DataService } from "./DataService";

export class Catalog {
    protected services:DataService[];

    constructor(obj:[any]) {
        this.services = new Array<DataService>();
        obj.forEach(service => {
            this.services[this.services.length] = new DataService(service);
        })
    }

    public getServices():DataService[] {
        return this.services;
    }
}