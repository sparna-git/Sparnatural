import { DataService } from "./DataService";

export class Catalog {
    protected services:DataService[] = new Array<DataService>();

    constructor(obj?:{service:[any]}) {
        if(obj) {
            obj.service.forEach(service => {
                this.services[this.services.length] = new DataService(service);
            })
        }
    }

    public extractSubCatalog(endpoints: string[]):Catalog {
        let c = new Catalog();
        c.services = this.getServices().filter(ds => endpoints.indexOf(ds.getEndpointURL()) > -1);
        return c;
    }

    public getServices():DataService[] {
        return this.services;
    }
}