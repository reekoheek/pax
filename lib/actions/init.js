var Q = require('q'),
    resolve = require('../utils/resolve');
// var resolverFactory = require('bower/lib/core/resolverFactory');

var print = function() {

};

module.exports = function(pkg, logger) {
    "use strict";

    var that = this,
        deferred = Q.defer(),
        row = {
            repository: pkg
        };

    resolve(row, logger, that).then(function(resolver) {
        logger.log('Fetching package...');
        resolver.fetch()
            .then(function(a) {
                logger.log('Initializing archetype...');
                return resolver.init(a);
            })
            .then(function() {
                return that.initTask();
            })
            .then(function() {
                return that.exec(['init'], logger);
            })
            .then(function() {
                deferred.resolve();
            },function(e) {
                deferred.reject(e);
            });
    }, function() {
        this.exec(['search', pkg]).then(function(searchResults) {
            row = null;
            if (searchResults[0]) {
                row = searchResults[0];

                return resolve(row, logger, that).then(function(resolver) {
                    logger.log('Fetching package...');
                    return resolver.fetch()
                        .then(function(a) {
                            logger.log('Initializing archetype...');
                            return resolver.init(a);
                        })
                        .then(function() {
                            return that.initTask();
                        })
                        .then(function() {
                            return that.exec(['init'], logger);
                        });
                });
            } else {
                throw new Error('Package ' + pkg + ' not found!');
            }
        }).then(function() {
            deferred.resolve();
        },function(e) {
            deferred.reject(e);
        });
    });

    return deferred.promise;
};