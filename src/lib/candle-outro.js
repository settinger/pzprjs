// candle-outro.js

})(module,exports);

pzpr.Candle = module.exports;

})();

//---------------------------------------------------------------------------
// node.js環境向けの対策
//---------------------------------------------------------------------------
/* jshint ignore:start */
    document      = this.document      || pzpr.Candle.document;
var DOMParser     = this.DOMParser     || pzpr.Candle.DOMParser;
var XMLSerializer = this.XMLSerializer || pzpr.Candle.XMLSerializer;
/* jshint ignore:end */
