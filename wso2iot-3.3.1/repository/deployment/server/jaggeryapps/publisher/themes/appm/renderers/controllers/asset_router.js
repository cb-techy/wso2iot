/*
 Description: Renders the asset.jag view
 Filename:asset.js
 Created Date: 29/7/2013
 */
var server = require('store').server;
var permissions = require('/modules/permissions.js').permissions;
var config = require('/config/publisher.json');
var appmPublisher = require('appmgtpublisher');
var businessOwnerHelper = require('../../helpers/businessowner.js');

var render = function(theme, data, meta, require) {

    var log = new Log();
    var apiProvider = jagg.module('manager').getAPIProviderObj();
    var user = server.current(session);
    var um = server.userManager(user.tenantId);
    var createActionAuthorized = permissions.isAuthorized(user.username, config.permissions.webapp_create, um);
    var publishActionAuthorized = permissions.isAuthorized(user.username, config.permissions.webapp_publish, um);
    var updateWebAppAuthorized = permissions.isAuthorized(user.username, config.permissions.webapp_update, um);
    var viewStatsAuthorized = permissions.isAuthorized(user.username, config.permissions.view_statistics, um);
    var appMgtProviderObj = new appmPublisher.APIProvider(String(user.username));
    var listPartial = 'view-asset';
    var heading = "";
    var newViewData;
    var notifications = session.get('notifications');
    var notificationCount = session.get('notificationCount');
    var typeList = apiProvider.getEnabledAssetTypeList();
    var appMDAO = Packages.org.wso2.carbon.appmgt.impl.dao.AppMDAO;
    var ADMIN_ROLE = Packages.org.wso2.carbon.context.PrivilegedCarbonContext.getThreadLocalCarbonContext().getUserRealm().getRealmConfiguration().getAdminRoleName();
    var appMDAOObj = new appMDAO();

    //Determine what view to show
    switch (data.op) {

        case 'create':
            listPartial = 'add-asset';
            heading = "Create New Web Application";
            break;
        case 'view':
            data = require('/helpers/view-asset.js').merge(data);
            data.typeList = typeList;
            listPartial = 'view-asset';
            var copyOfData = parse(stringify(data));
            data.newViewData = require('/helpers/splitter.js').splitData(copyOfData);
            var assetThumbnail = data.newViewData.images.images_thumbnail;
            if (!assetThumbnail || (assetThumbnail.trim().length == 0)) {
                var appName = String(data.newViewData.displayName.value);
                data.newViewData.images.defaultThumbnail = appMgtProviderObj.getDefaultThumbnail(appName);
            }
            data.newViewData.publishActionAuthorized = publishActionAuthorized;
            if(data.artifact.attributes.overview_subscriptionAvailability == "current_tenant") {
                data.newViewData.showExternalStoreTab = false;
            } else if (data.artifact.attributes.overview_subscriptionAvailability == "specific_tenants") {
                var appStores = data.appStores.externalStores;
                var noOfStoreToList = 0;
                for(var i = 0; i < appStores.length; i++) {
                    var appStore = appStores[i];
                    if( (data.artifact.attributes.overview_tenants.indexOf(appStore.name) > -1)) {
                        appStore.showInStoreList = true;
                        appStores[i] = appStore;
                        noOfStoreToList++;
                    } else {
                        appStore.showInStoreList = false;
                    }
                }
                data.appStores.externalStores = appStores;
                if(noOfStoreToList > 0) {
                    data.newViewData.showExternalStoreTab = true;
                }
            } else {
                var appStores = data.appStores.externalStores;
                for(var i = 0; i < appStores.length; i++) {
                    var appStore = appStores[i];
                    appStore.showInStoreList = true;
                }
                data.appStores.externalStores = appStores;
                data.newViewData.showExternalStoreTab = true;
            }

            heading = data.newViewData.displayName.value;
            var businessOwnerAttribute = data.artifact.attributes.overview_businessOwner;
            if (businessOwnerAttribute != null && businessOwnerAttribute.trim() != "" && businessOwnerAttribute
                                                                                         != "null") {
                var businessOwner = apiProvider.getBusinessOwner(businessOwnerAttribute);
                data.businessOwnerViewData = businessOwnerHelper.transform(businessOwner);
                data.businessOwner = businessOwner;
            }
            break;
        case 'edit':
            var editEnabled = permissions.isEditPermitted(user.username, data.artifact.path, um);
            if (data.artifact.lifecycleState == "Published") {
                editEnabled = false;
            }
            if (user.hasRoles([ADMIN_ROLE]) || updateWebAppAuthorized) {
                editEnabled = true;
            }
            if (!editEnabled) {
                response.sendError(404);
            }
            data = require('/helpers/edit-asset.js').processData(data);
            listPartial = 'edit-asset';
            var copyOfData = parse(stringify(data));
            data.newViewData = require('/helpers/splitter.js').splitData(copyOfData);
            heading = data.newViewData.displayName.value;
            var businessOwnerId = data.artifact.attributes.overview_businessOwner;
            if (businessOwnerId != null && businessOwnerId.trim() != "" && businessOwnerId != "null") {
                var businessOwner = apiProvider.getBusinessOwner(businessOwnerId);
                data.businessOwner = businessOwner;
            }
            break;
        case 'lifecycle':
            listPartial = 'lifecycle-asset';
            var copyOfData = parse(stringify(data));
            data.newViewData = require('/helpers/splitter.js').splitData(copyOfData);
            heading = data.newViewData.displayName.value + " - Lifecycle";
            break;
        case 'versions':
            listPartial = 'versions-asset';
            var copyOfData = parse(stringify(data));
            data.newViewData = require('/helpers/splitter.js').splitData(copyOfData);
            heading = data.newViewData.displayName.value + " - Versions";
            break;
        case 'copyapp':
            data = require('/helpers/copy-app.js').processData(data);
            listPartial = 'copy-app';
            var copyOfData = parse(stringify(data));
            data.newViewData = require('/helpers/splitter.js').splitData(copyOfData);
            heading = data.newViewData.displayName.value;
            break;
        default:
            break;
    }


    theme('single-col-fluid', {
        title: data.title,
        header: [{
            partial: 'header',
            context: data
        }],
        ribbon: [{
            partial: 'ribbon',
            context: {
                active: listPartial,
                createPermission: createActionAuthorized,
                viewStats: viewStatsAuthorized,
                um: um,
                notifications: notifications,
                notificationCount: notificationCount,
                typeList: typeList
            }
        }],
        leftnav: [{
            partial: 'left-nav',
            context: require('/helpers/left-nav.js').generateLeftNavJson(data, listPartial)
        }],
        listassets: [{
            partial: listPartial,
            context: data
        }],
        heading: [{
            partial: 'heading',
            context: {
                title: heading,
                menuItems: require('/helpers/left-nav.js').generateLeftNavJson(data, listPartial)
            }
        }]
    });

};