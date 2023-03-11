/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ShieldDetails } from '../../types/actions/shieldsPanelActions';
import { BlockOptions } from '../../types/other/blockTypes'
import * as resourceIdentifiers from '../../constants/resourceIdentifiers'
import { isHttpOrHttps, hasPortNumber } from '../../helpers/urlUtils'
import actions from '../actions/shieldsPanelActions'

/**
 * Obtains the shields panel data for the specified tab data
 * @param {Object} tabData the details of the tab
 * @return a promise with the corresponding shields panel data for the input tabData
 */
export const getShieldSettingsForTabData = (tabData?: chrome.tabs.Tab) => {
  if (tabData === undefined || !tabData.url) {
    return Promise.reject(new Error('No tab url specified'))
  }

  const url = new window.URL(tabData.url)
  const origin = url.origin
  const hostname = url.hostname

  return Promise.all([
    chrome.broowzerShields.plugins.getAsync({ primaryUrl: origin, resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_BROOWZER_SHIELDS } }),
    chrome.broowzerShields.plugins.getAsync({ primaryUrl: origin, resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_ADS } }),
    chrome.broowzerShields.plugins.getAsync({ primaryUrl: origin, resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_TRACKERS } }),
    chrome.broowzerShields.plugins.getAsync({ primaryUrl: origin, resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_HTTP_UPGRADABLE_RESOURCES } }),
    chrome.broowzerShields.javascript.getAsync({ primaryUrl: origin }),
    chrome.broowzerShields.plugins.getAsync({ primaryUrl: origin, resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_FINGERPRINTING } }),
    chrome.broowzerShields.plugins.getAsync({ primaryUrl: origin, secondaryUrl: 'https://firstParty/*', resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_FINGERPRINTING } }),
    chrome.broowzerShields.plugins.getAsync({ primaryUrl: origin, resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_COOKIES } }),
    chrome.broowzerShields.plugins.getAsync({ primaryUrl: origin, secondaryUrl: 'https://firstParty/', resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_COOKIES } })
  ]).then((details) => {
    const fingerprinting = details[5].setting !== details[6].setting ? 'block_third_party' : details[5].setting
    const cookies = details[7].setting !== details[8].setting ? 'block_third_party' : details[7].setting
    const broowzerShields = isHttpOrHttps(origin) ? details[0].setting : 'block'
    return {
      url: url.href,
      origin,
      hostname,
      id: tabData.id,
      broowzerShields,
      ads: details[1].setting,
      trackers: details[2].setting,
      httpUpgradableResources: details[3].setting,
      javascript: details[4].setting,
      fingerprinting,
      cookies
    }
  }).catch(() => {
    return {
      url: url.href,
      origin,
      hostname,
      id: tabData.id,
      broowzerShields: 'block',
      ads: 0,
      trackers: 0,
      httpUpgradableResources: 0,
      javascript: 0,
      fingerprinting: 0
    }
  })
}

const getScope = () =>
  chrome.extension.inIncognitoContext ? 'incognito_session_only' : 'regular'

/**
 * Obtains specified tab data
 * @return a promise with the active tab data
 */
export const getTabData = (tabId: number) =>
  chrome.tabs.getAsync(tabId)

/**
 * Obtains new information about the shields panel settings for the specified tabId
 * @param {number} tabId the tabId of the tab who's content settings are of interest
 * @return a promise which resolves with the updated shields panel data.
 */
export const requestShieldPanelData = (tabId: number) =>
  getTabData(tabId)
    .then(getShieldSettingsForTabData)
    .then((details: ShieldDetails) => {
      actions.shieldsPanelDataUpdated(details)
    })

const getPrimaryPatternForOrigin = (origin: string) => {
  // When url includes port w/o scheme, chromium parses it as an invalid port
  // number.
  if (hasPortNumber(origin) && isHttpOrHttps(origin)) {
    return origin + '/*'
  }
  return origin.replace(/^(http|https):\/\//, '*://') + '/*'
}

/**
 * Changes the broowzer shields setting at origin to be allowed or blocked.
 * @param {string} origin the origin of the site to change the setting for
 * @param {string} setting 'allow' or 'block'
 * @return a promise which resolves when the setting is set
 */
export const setAllowBroowzerShields = (origin: string, setting: string) =>
  chrome.broowzerShields.plugins.setAsync({
    primaryPattern: getPrimaryPatternForOrigin(origin),
    resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_BROOWZER_SHIELDS },
    setting,
    scope: getScope()
  })

/**
 * Changes the ads at origin to be allowed or blocked.
 * The ad-block service will come into effect if the ad is marked as blocked.
 * @param {string} origin the origin of the site to change the setting for
 * @param {string} setting 'allow' or 'block'
 * @return a promise which resolves when the setting is set
 */
export const setAllowAds = (origin: string, setting: string) =>
  chrome.broowzerShields.plugins.setAsync({
    primaryPattern: origin + '/*',
    resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_ADS },
    setting,
    scope: getScope()
  })

/**
 * Changes the trackers at origin to be allowed or blocked.
 * The tracking-protection service will come into effect if the tracker is marked as blocked.
 * @param {string} origin the origin of the site to change the setting for
 * @param {string} setting 'allow' or 'block'
 * @return a promise which resolves with the setting is set
 */
export const setAllowTrackers = (origin: string, setting: string) =>
  chrome.broowzerShields.plugins.setAsync({
    primaryPattern: origin + '/*',
    resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_TRACKERS },
    setting,
    scope: getScope()
  })

/**
 * Changes the http upgrdabable resources to be allows as is or blocked.
 * The https-everywhere service will come into effect if the resource is marked as blocked.
 * @param {string} origin the origin of the site to change the setting for
 * @return a promise which resolves when the setting is set
 */
export const setAllowHTTPUpgradableResources = (origin: string, setting: BlockOptions) => {
  const primaryPattern = getPrimaryPatternForOrigin(origin)
  return chrome.broowzerShields.plugins.setAsync({
    primaryPattern,
    resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_HTTP_UPGRADABLE_RESOURCES },
    setting,
    scope: getScope()
  })
}

/**
 * Changes the Javascript to be on (allow) or off (block)
 * @param {string} origin the origin of the site to change the setting for
 * @param {string} setting 'allow' or 'block'
 * @return a promise which resolves when the setting is set
 */
export const setAllowJavaScript = (origin: string, setting: string) =>
  chrome.broowzerShields.javascript.setAsync({
    primaryPattern: origin + '/*',
    setting,
    scope: getScope()
  })

/**
 * Changes the fingerprinting at origin to be allowed or blocked.
 * The fingerprinting-protection service will come into effect if the fingerprinting is marked as blocked.
 * @param {string} origin the origin of the site to change the setting for
 * @return a promise which resolves with the setting is set
 */
export const setAllowFingerprinting = (origin: string, setting: string) => {
  const originSetting = setting === 'allow' ? 'allow' : 'block'
  const firstPartySetting = setting === 'block' ? 'block' : 'allow'

  const p1 = chrome.broowzerShields.plugins.setAsync({
    primaryPattern: origin + '/*',
    resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_FINGERPRINTING },
    setting: originSetting,
    scope: getScope()
  })

  const p2 = chrome.broowzerShields.plugins.setAsync({
    primaryPattern: origin + '/*',
    secondaryPattern: 'https://firstParty/*',
    resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_FINGERPRINTING },
    setting: firstPartySetting,
    scope: getScope()
  })

  return Promise.all([p1, p2])
}

/**
 * Changes the cookie at origin to be allowed or blocked.
 * @param {string} origin the origin of the site to change the setting for
 * @return a promise which resolves with the setting is set
 */
export const setAllowCookies = (origin: string, setting: string) => {
  const originSetting = setting === 'allow' ? 'allow' : 'block'
  const firstPartySetting = setting === 'block' ? 'block' : 'allow'

  const p1 = chrome.broowzerShields.plugins.setAsync({
    primaryPattern: origin + '/*',
    resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_REFERRERS },
    setting: originSetting,
    scope: getScope()
  })

  const p2 = chrome.broowzerShields.plugins.setAsync({
    primaryPattern: origin + '/*',
    resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_COOKIES },
    setting: originSetting,
    scope: getScope()
  })

  const p3 = chrome.broowzerShields.plugins.setAsync({
    primaryPattern: origin + '/*',
    secondaryPattern: 'https://firstParty/*',
    resourceIdentifier: { id: resourceIdentifiers.RESOURCE_IDENTIFIER_COOKIES },
    setting: firstPartySetting,
    scope: getScope()
  })

  return Promise.all([p1, p2, p3])
}

/**
 * Toggles the input value between allow and block
 * @return the toggled value
 */
export const toggleShieldsValue = (value: BlockOptions) =>
  value === 'allow' ? 'block' : 'allow'

/**
 * Temporary allow a set of script origins for a specific tab until reload.
 * @param {Array<string>} origins a set of script origins to be allowed
 * @param {number} tabId ID of the tab which these origins are allowed in
 * @return a promise which resolves when the origins are set.
 */
export const setAllowScriptOriginsOnce = (origins: Array<string>, tabId: number) =>
  new Promise<void>((resolve) => {
    chrome.broowzerShields.allowScriptsOnce(origins, tabId, () => {
      resolve()
    })
  })
