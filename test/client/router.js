/* global describe, it, beforeEach */
'use strict';
var expect = require('chai').expect;

describe('router', function() {
  var fluxApp = require('../../lib');

  fluxApp.setPlatform('browser');

  fluxApp.createRoutes([
    {
      id : 1,
      path : '/index',
      method : 'GET'
    },
    {
      id : 2,
      path : '/index(/?)',
      method : 'POST'
    },
    {
      id : 3,
      path : '/test/:named/:params'
    },
    {
      id : 4,
      path : '/test/optional/:params?'
    },
    {
      id : 5,
      path : '/notFound',
      notFound : true
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
      expect(fluxApp.createRoute).to.be.a('function');
    });

    it('should have an matchRoute method', function() {
      expect(fluxApp.matchRoute).to.be.a('function');
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
});
