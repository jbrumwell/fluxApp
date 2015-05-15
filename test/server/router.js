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
      path : '/',
      handler: _.noop,
      notFound : true
    },
    {
      id : 6,
      path : '/route/with/:end?very=cool',
      handler: _.noop
    },

    {
      id : 7,
      path : '/admin/',
      handler: _.noop,
      notFound : true
    },
  ]);

  var router = fluxApp.getRouter();

  it('should have an addRoute method', function() {
    expect(router.addRoute).to.be.a('function');
  });

  it('should have an getRouteByUrl method', function() {
    expect(router.getRouteByUrl).to.be.a('function');
  });

  it('should have an getParserById method', function() {
    expect(router.getParserById).to.be.a('function');
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
      var route = router.getRouteByUrl('/index', {
        method : 'GET'
      });

      expect(route.id).to.equal(1);

      route = router.getRouteByUrl('/index', {
        method : 'POST'
      });

      expect(route.id).to.equal(2);
    });

    it('should accept named parameters', function() {
      var route = router.getRouteByUrl('/test/flux/rools');

      expect(route.id).to.equal(3);
    });

    it('should allow optional param', function() {
      var route = router.getRouteByUrl('/test/optional');

      expect(route.id).to.equal(4);
    });

    it('should provide a 404 not found method', function() {
      var route = router.getRouteByUrl('/something/doesnt/exist/here?query=query');

      expect(route.id).to.equal(5);
    });

    it('should provide a multiple 404 not found methods', function() {
      var route = router.getRouteByUrl('/admin/something/doesnt/exist/here?query=query');

      expect(route.id).to.equal(7);
    });

    it('should provide a 404 not found method (By id)', function() {
      var route = router.getRouteById('not-found');

      expect(route.id).to.equal(5);
    });
  });

  describe('Generating', function() {
    it('should return the parser', function() {
      var parser = router.getParserById(1);

      expect(parser.match).to.be.a('function');
      expect(parser.reverse).to.be.a('function');
    });

    it('should pull named params from the url', function() {
      var request = router.build('/test/first/second');

      expect(request.params.named).to.equal('first');
      expect(request.params.params).to.equal('second');
    });

    it('should parse query params', function() {
      var request = router.build('/index?something=else&that=this');

      expect(request.query.something).to.equal('else');
      expect(request.query.that).to.equal('this');
    });

    it('should match full urls', function() {
      var request = router.build('https://user:pass@domain.ext/index?something=else&that=this');

      expect(request.query.something).to.equal('else');
      expect(request.query.that).to.equal('this');
    });

    it('should be able to generate a simple path', function() {
      var route = router.build(1);

      expect(route.url).to.equal('/index');
    });

    it('should be able to generate a path with optional params', function() {
      var route = router.build(4);

      expect(route.url).to.equal('/test/optional');
    });

    it('should be able to generate a path with params', function() {
      var route = router.build(4, {
        params: {
          params: 'test',
        }
      });

      expect(route.url).to.equal('/test/optional/test');
    });

    it('should be able to generate by path', function() {
      var route = router.build('/index');

      expect(route.url).to.equal('/index');
    });

    it('should be able to generate by path with params', function() {
      var route = router.build('/test/here/there');

      expect(route.url).to.equal('/test/here/there');
    });

    it('should be able to generate query parameters', function() {
      var route = router.build(4, {
        params: {
          params: 'there',
        },

        query: {
          testing: 'here'
        },
      });

      expect(route.url).to.equal('/test/optional/there?testing=here');
    });

    it('should be able to generate additional query parameters', function() {
      var route = router.build(6, {
        params: {
          end: 'query',
        },

        query: {
          cool: 'indeed',
        },
      });

      expect(route.url).to.equal('/route/with/query?very=cool&cool=indeed');
    });

    it('should be able to generate path with hash', function() {
      var route = router.build(6, {
        params: {
          end: 'query',
        },

        query: {
          cool: 'indeed',
        },

        hash: 'myid'
      });

      expect(route.url).to.equal('/route/with/query?very=cool&cool=indeed#myid');
    });

    it('should return false if id does not exist', function() {
      var route = router.build(10, {
        params: {
          end: 'query',
        },

        query: {
          cool: 'indeed',
        },

        hash: 'myid'
      });

      expect(route).to.equal(false);
    });

    it('should return false if path does not exist', function() {
      var route = router.build('/not-here', {
        params: {
          end: 'query',
        },

        query: {
          cool: 'indeed',
        },

        hash: 'myid'
      });

      expect(route).to.equal(false);
    });
  })
});
