/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import '../../../../app/background/events/shieldsEvents'
import actions from '../../../../app/background/actions/shieldsPanelActions'
import { blockedResource } from '../../../testData'

describe('shieldsEvents events', () => {
  describe('chrome.broowzerShields.onBlocked listener', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(actions, 'resourceBlocked')
    })
    afterEach(() => {
      spy.mockRestore()
    })
    it('forward details to actions.resourceBlocked', (cb) => {
      chrome.broowzerShields.onBlocked.addListener((details) => {
        expect(details).toBe(blockedResource)
        expect(spy).toBeCalledWith(details)
        cb()
      })
      chrome.broowzerShields.onBlocked.emit(blockedResource)
    })
  })
})
