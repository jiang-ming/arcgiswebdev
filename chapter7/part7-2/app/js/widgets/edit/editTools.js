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
  'esri/graphic',
  // template
  'widgets/edit/editService',
  'utils/symbolUtil',
  'text!widgets/edit/editTools.tpl.html'
], function(declare, lang, on, query, _WidgetBase, _TemplatedMixin, domAttr, Graphic, EditService, symbolUtil, template) {

  return declare([_WidgetBase, _TemplatedMixin], {

    templateString: template,

    options: {},

    editing: false,

    map: null,

    // lifecycle 1
    constructor: function(options, srcRefNode) {

      // mix in settings and defaults
      declare.safeMixin(this.options, options);
      this.map = this.options.map;
      this.requestLayer = this.map.getLayer('Requests');

      this.editService = new EditService({
        layer: this.requestLayer,
        map: this.map
      });

      // widget node
      this.domNode = srcRefNode;
    },

    postCreate: function() {
      // pausable listener
      this.handler = on.pausable(this.map, 'click', lang.hitch(this, this._addPoint));

      this.handler.pause();
      this.own(
        on(this.domNode, '.btn-edit:click', lang.hitch(this, this._toggleEditButton)),
        on(this.domNode, '.btn-sync:click', lang.hitch(this, this._syncLocal))
      );
    },
    // public methods

    // widget methods
    _addRequest: function() {
      this._toggleEditButton();
    },

    _syncLocal: function() {
      console.debug('has local?', this.editService.hasLocal);
      if (this.editService.hasLocal) {
        this.editService.sync();
      }
    },

    // private functions
    _addPoint: function(e) {
      var mapPt = e.mapPoint
        , census = e.graphic
        , attributes = {}
        , graphic
        , description;

      description = window.prompt('Description of request');
      attributes.IssueType = this.requesttype;
      attributes.RequestDate = new Date().getTime();
      attributes.CensusTract = census.attributes.NAME;
      attributes.Description = description;
      console.debug('attr', attributes);

      graphic = new Graphic(mapPt, symbolUtil.simpleMarker(), attributes);

      this.editService.add([graphic]).then(
        lang.hitch(this, function() {
        this._toggleEditButton();
        alert('Request submitted');
      }),
      lang.hitch(this, function() {
        this._toggleEditButton();
        this.map.graphics.add(graphic);
        alert('Request saved locally');
      })
      );
    },

    _toggleEditButton: function(e) {
      this.editing = !this.editing;
      this.requesttype = '';
      if (e) {
        this.requesttype = domAttr.get(e.target, 'data-type');
        query(e.target).toggleClass('btn-primary');
        query(e.target).toggleClass('btn-success');
      }
      if(this.editing) {
        query('.btn-primary')
        .removeClass('btn-primary')
        .attr('disabled', 'disabled');
        this.handler.resume();
      } else {
        query('.btn-edit')
        .removeClass('btn-success')
        .addClass('btn-primary')
        .removeAttr('disabled');
        this.handler.pause();
      }
    }

  });

});
