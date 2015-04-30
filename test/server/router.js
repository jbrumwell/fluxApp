/* global describe, it, beforeEach */
'use strict';
var expect = require('chai').expect;
var _ = require('lodash');

describe('router', function() {
  var fluxApp = require('../../lib');

  fluxApp.registerRoutes([
    {
      id : 1,
      path : '/index',
      handler: _.noop,
      method : 'GET'
    },
    {
      id : 2,
      path : '/index(/?)',
      handler: _.noop,
      method : 'POST'
    },
    {
      id : 3,
      handler: _.noop,
      path : '/test/:named/:params'
    },
    {
      id : 4,
      handler: _.noop,
      path : '/test/optional(/:params)'
    },
    {
      id : 5,
      path : '/notFound',
      handler: _.noop,
      notFound : true
    },
    {
      id : 6,
      path : '/route/with/:end?very=cool',
      handler: _.noop
    }
  ]);

  var router = fluxApp.getRouter();

  it('should have an addRoute method', function() {
    expect(router.addRoute).to.be.a('function');
  });

  it('should have an getRoute method', function() {
    expect(router.getRoute).to.be.a('function');
  });

  describe('fluxApp', function() {
    it('should have an getRouter method', function() {
      expect(fluxApp.getRouter).to.be.a('function');
    });

    it('should have an createRoute method', function() {
      expect(fluxApp.registerRoute).to.be.a('function');
    });

    it('should have an createRoutes method', function() {
      expect(fluxApp.registerRoutes).to.be.a('function');
    });
  });

  describe('Matching', function() {
    it('should consider route method if provided', function() {
      var route = router.getRoute('/index', {
        method : 'GET'
      });

      expect(route.id).to.equal(1);

      route = router.getRoute('/index', {
        method : 'POST'
      });

      expect(route.id).to.equal(2);
    });

    it('should accept named parameters', function() {
      var route = router.getRoute('/test/flux/rools');

      expect(route.id).to.equal(3);
    });

    it('should allow optional param', function() {
      var route = router.getRoute('/test/optional');

      expect(route.id).to.equal(4);
    });

    it('should provide a 404 not found method', function() {
      var route = router.getRoute('/something/doesnt/exist/here');

      expect(route.id).to.equal(5);
    });

    it('should provide a 404 not found method (By id)', function() {
      var route = router.getRouteById('not-found');

      expect(route.id).to.equal(5);
    });

    it('should pull named params from the url', function() {
      var route = router.getRoute('/test/first/second');

      expect(route.params.named).to.equal('first');
      expect(route.params.params).to.equal('second');
    });

    it('should parse query params', function() {
      var route = router.getRoute('/index?something=else&that=this');

      expect(route.query.something).to.equal('else');
      expect(route.query.that).to.equal('this');
    });
  });

  describe('Generating', function() {
    it('should be able to generate a simple path', function() {
      var path = router.build(1);

      expect(path).to.equal('/index');
    });

    it('should be able to generate a path with optional params', function() {
      var path = router.build(4);

      expect(path).to.equal('/test/optional');
    });

    it('should be able to generate a path with params', function() {
      var path = router.build(4, {
        params: {
          params: 'test',
        }
      });

      expect(path).to.equal('/test/optional/test');
    });

    it('should be able to generate by path', function() {
      var path = router.build('/index');

      expect(path).to.equal('/index');
    });

    it('should be able to generate by path with params', function() {
      var path = router.build('/test/here/there');

      expect(path).to.equal('/test/here/there');
    });

    it('should be able to generate query parameters', function() {
      var path = router.build(4, {
        params: {
          params: 'there',
        },

        query: {
          testing: 'here'
        },
      });

      expect(path).to.equal('/test/optional/there?testing=here');
    });

    it('should be able to generate additional query parameters', function() {
      var path = router.build(6, {
        params: {
          end: 'query',
        },

        query: {
          cool: 'indeed',
        },
      });

      expect(path).to.equal('/route/with/query?very=cool&cool=indeed');
    });

    it('should be able to generate path with hash', function() {
      var path = router.build(6, {
        params: {
          end: 'query',
        },

        query: {
          cool: 'indeed',
        },

        hash: 'myid'
      });

      expect(path).to.equal('/route/with/query?very=cool&cool=indeed#myid');
    });
  })
});
