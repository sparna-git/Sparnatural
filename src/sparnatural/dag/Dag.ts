
export class Dag<Payload> implements DagIfc<Payload> {
    roots:DagNodeIfc<Payload>[];

    constructor() {
        this.roots = new Array<DagNodeIfc<Payload>>();
    }

    toDebugString():string {
        let result = "";
        this.roots.forEach(root => {
            result += root.toDebugString(0);
        })
        return result;
    }

    initFromFlatList(hierarchy: Map<string, string[]>, data:Map<string, Payload>): void {
        this.roots = new Array<DagNode<Payload>>();

        // Create all nodes
        const nodes: Map<string, DagNode<Payload>> = new Map();
        for (const [id, parentIds] of hierarchy.entries()) {
            if (!nodes.has(id)) {
                nodes.set(id, new DagNode(id, data.get(id)));
            }
            if (parentIds !== null) {
                parentIds.forEach(parentId => {
                    if(!nodes.has(parentId)) {
                        nodes.set(parentId, new DagNode(parentId, data.get(parentId)));
                    }
                })
            }
        }

        // Establish parent-child relationships
        for (const [id, parentIds] of hierarchy.entries()) {
            const currentNode = nodes.get(id)!;

            if(parentIds === null || parentIds.length == 0)
                this.roots.push(currentNode);
            else {
                parentIds.forEach(parentId => {
                    const parentNode = nodes.get(parentId)!;
                    currentNode.moveUnder(parentNode);
                })                
            }
        }
    }

    initFromIdableEntity(hierarchy: Map<string, string>, data:Array<Payload & {getId():string}>): void {
        let dataMap:Map<string, Payload> = new Map<string, Payload>();
        data.forEach((item)=> {
            dataMap.set(item.getId(), item);
        });
        
        let hierarchyMap:Map<string, string[]> = new Map<string, string[]>();
        hierarchy.forEach((value:string, key:string) => {
            hierarchyMap.set(key, [value]);
        })
        this.initFromFlatList(hierarchyMap, dataMap);
    }

    initFromParentableAndIdAbleEntity(data:Array<Payload & {getId():string} & {getParents():string[]}>): void {
        let dataMap:Map<string, Payload> = new Map<string, Payload>();
        data.forEach((item)=> {
            dataMap.set(item.getId(), item);
        });
        let hierarchyMap:Map<string, string[]> = new Map<string, string[]>();
        data.forEach((item)=> {
            hierarchyMap.set(item.getId(), item.getParents());
        });

        this.initFromFlatList(hierarchyMap, dataMap);
    }
}

export class DagNode<Payload> implements DagNodeIfc<Payload> {
    public id: string;
    // never null
    public parents: DagNodeIfc<Payload>[];
    // never null
    public children: DagNodeIfc<Payload>[];
    public payload: Payload;

    constructor(id: string, payload: Payload) {
        this.id = id;
        this.payload = payload;
        this.parents = new Array<DagNodeIfc<Payload>>();
        this.children = new Array<DagNodeIfc<Payload>>();
    }

    /**
     * Adds this node under a new parent. Existing parents are kept
     * @param parent the new parent or null to set a root node
     */
    public addUnder(parent:DagNodeIfc<Payload>|null) {
        // link with parent if a parent was given    
        if(parent) {
            this.parents.push(parent);          
            parent.children.push(this);
        }
    }


    /**
     * Moves this node under a new parent. This will unlink the node from its existing parents
     * @param parent the new parent or null to set a root node
     */
    public moveUnder(parent:DagNodeIfc<Payload>|null) {

        // unlink from current parents
        let theId = this.id;
        this.parents.forEach(p => {
            p.children = p.children.filter(n => n.id != theId);
        })

        // reset parents
        this.parents = new Array<DagNodeIfc<Payload>>();
        // then add it under new parent
        this.addUnder(parent);
    }


    public sort(compareFn: (a:Payload, b:Payload) => number) {
        // when sorting the children array, sort their payload
        this.children.sort((a:DagNodeIfc<Payload>, b:DagNodeIfc<Payload>) => {
            return compareFn(a.payload, b.payload);
        });
        // then sort recursively
        this.children.forEach(c => c.sort(compareFn));
    }

    toDebugString(depth:number):string {
        let indent = "";
        for (let i = 0; i < depth; i++) {
            indent += " ";            
        }
        let result = indent+"id:"+this.id+"\n";
        this.children.forEach(child => {
            result += child.toDebugString(depth+2);
        })
        return result;
    }
}

/**
 * A node in a DAG. Just like a tree node, but with multiple parents
 */
export interface DagNodeIfc<Payload> {
    id: string;
    parents:DagNodeIfc<Payload>[];
    children:DagNodeIfc<Payload>[];
    payload:Payload;

    toDebugString(depth:number):string;

    sort: (compareFn:(a:Payload, b:Payload)=> number) => void;
}

/**
 * Directed Acyclic Graph
 */
export interface DagIfc<Payload> {
    roots:DagNodeIfc<Payload>[];

    toDebugString():string;
}