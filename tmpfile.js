function ActionWhere(GroupContenaire, specProvider) {
    this.baseCssClass = "ActionWhere";
    this.specProvider = specProvider;
    this.ParentComponent = GroupContenaire ;
    this.HtmlContainer = {} ;
    this.cssClasses = {
        ActionWhere : true,
        ShowOnEdit : true,
        Created : false
    };

    this.init = function (reload = false) {
        if (this.ParentComponent.reinsert && !reload) {
            return this.reload() ;
        }
            
        var endClassGroup = this.ParentComponent.parentCriteriaGroup.EndClassGroup ;
        var choiceNumber = 2 ;
        if (endClassGroup.parentCriteriaGroup.EndClassWidgetGroup.inputTypeComponent.widgetHtml == null) {
            choiceNumber = 1 ;
            $(endClassGroup.html).addClass('noPropertyWidget') ;
        } else {
            $(endClassGroup.html).removeClass('noPropertyWidget') ;
        }
        var endLabel = specProvider.getLabel(endClassGroup.value_selected) ;
        var widgetLabel = '<span class="trait-top"></span><span class="edit-trait"><span class="edit-num">'+choiceNumber+'</span></span>'+langSearch.Search+' '+ endLabel + ' '+langSearch.That+'...' ;

        this.widgetHtml = widgetLabel+'<a>+</a>' ;
        this.cssClasses.IsOnEdit = true ;
        this.tools = new GenericTools(this) ;
        this.tools.initHtml() ;
        this.tools.attachHtml() ;

        this.cssClasses.Created = true ;
    } ;	
    
    this.reload = function() {
        this.init(true);
    } ;
}