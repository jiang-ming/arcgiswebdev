/*global define*/
/*jshint laxcomma:true*/
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/query',
  // Dijit stuff
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  // dom stuff
  'dojo/dom-attr',
  'dojo/dom-class',
  'esri/graphic',
  // template
  'text!widgets/edit/editTools.tpl.html'
], function(declare, lang, on, query, _WidgetBase, _TemplatedMixin, domAttr, domClass, Graphic, template) {

  return declare([_WidgetBase, _TemplatedMixin], {

    templateString: template,

    options: {},

    editing: false,

    map: null,

    // lifecycle 1
    constructor: function(options) {
      this.options = options || {};
      this.map = this.options.map;
      this.requestLayer = this.map.getLayer('Requests');
    },

    postCreate: function() {
      // pausable listener
      this.handler = on.pausable(this.map, 'click', lang.hitch(this, '_addPoint'));

      this.handler.pause();
      this.own(
        this.handler,
        on(this.domNode, '.btn-edit:click', lang.hitch(this, '_toggleEditButton'))
      );
    },
    // public methods

    // widget methods
    _addRequest: function() {
      this._toggleEditButton();
    },

    // private functions
_addPoint: function(e) {
     var mapPt = e.mapPoint
       , census = e.graphic
       , attributes = {}
       , graphic
       ,description;
       description=prompt('Description of request');
     attributes.IssueType =this.requesttype;
     attributes.RequestDate = new Date().getTime();
     attributes.CensusTract = census.attributes.NAME;
     attributes.Description=description;
     graphic = new Graphic(mapPt, null, attributes);
      this.requestLayer.applyEdits([graphic]).then(lang.hitch(this, function() {
       this._toggleEditButton();
       alert('Request submitted');
     }));
  },

  _toggleEditButton: function(e) {
        this.editing = !this.editing;
        this.requesttype='';
        if (e){
          this.requesttype=domAttr.get(e.target, 'data-type');
          domClass.toggle(e.target,'btn-primary btn-success');
        }
        if(this.editing) {
          query('.btn-primary', this.domNode)
            .removeClass('btn-primary')
            .attr('disabled','disabled');
          this.handler.resume();
        } else {
          query('.btn-edit',this.domNode)
            .removeClass('btn-success')
            .addClass('btn-primary')
            .removeAttr('disabled');
          this.handler.pause();
        }
     }

  });

});
