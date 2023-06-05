/*
 *  Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function initializeExit() {
    $(".removeGeoFence").tooltip();
    $("#exit-alert > tbody").empty();
    var serverUrl = "/api/device-mgt/v1.0/geo-services/alerts/Exit";
    invokerUtil.get(serverUrl, function (response) {
        if (response) {
            response = JSON.parse(response);
        }
        if (response && response.length) {
            $(".fence-not-exist").hide();
            $("#exit-alert").show();
            for (var index in response) {
                var alertBean = response[index];
                $("#exit-alert > tbody").append(
                    "<tr class='viewGeoFenceRow' style='cursor: pointer' data-areaName='" + alertBean.areaName  +
                    "' data-queryName='" + alertBean.queryName + "'data-geoJson="+ alertBean.geoJson +"><td>" + alertBean.areaName  + "</td>" +
                    "<td>" + alertBean.queryName + "</td><td>" + formatDate(new Date(alertBean.createdTime)) + "</td>" +
                    "<td onClick=removeGeoFence(this.parentElement,'Exit') class='removeGeoFence'" +
                    " data-toggle='tooltip' title='Remove fence' ><i class='fa fa-trash-o'></i></td></tr>");
            }
        } else {
            $(".fence-not-exist").show();
            $("#exit-alert").hide();
        }
        $('.viewGeoFenceRow td:not(:last-child)').click(function () {
            viewFence(this.parentElement,'Exit');
        });
    });
}
initializeExit();