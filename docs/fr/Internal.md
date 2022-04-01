_[Accueil](/fr) > Structure interne_

# Structure interne

**!!! This is outdated !!!**

What are the comcepts in this code ? We have defined components to construct the GUI.
Here is how the components relate together.

![](https://github.com/sparna-git/sparnatural/blob/master/documentation/structure-components.png)

# Components properties

## CriteriaGroup
Group component to create a criteria to search.

### Component statements
* HasAllComplete : true if all sub component are completed
* IsOnEdit : if sub element is IsOnEdit statement

### Events
* Completed : All sub element values are selected
* Created : Before sub elements are edited on new criteria creation

## Group containers
This first subs elements of criteriaGroup that contain selector for Class, objectProperties and selected values for Class

### Component statements
* HasInputsCompleted
* IsOnEdit

### Events
* StartEdit
* EndEdit
* Completed

## Inputs type componement
In the group containers inout type are interactive eelement to select values of criteria (Class, ObjectProperty, Value of Class

### Component statements
* IsCompleted
* IsOnEdit

### Events
* StartEdit
* EndEdit
* Completed

## Contextual component
To retrieve where the CriteriaGroup is use for apply any rules for construct criteria
ChidrensCriteriaGroup and Context are instance of corresponding CriteriaGroup

