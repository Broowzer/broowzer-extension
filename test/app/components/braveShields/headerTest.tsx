/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import ShieldsHeader, { Props } from '../../../../app/components/broowzerShields/header'
import { BlockOptions } from '../../../../app/types/other/blockTypes'
import * as actionTypes from '../../../../app/constants/shieldsPanelTypes'
import { shallow } from 'enzyme'

const fakeProps: Props = {
  tabData: {
    hostname: 'broowzer.com',
    origin: 'https://broowzer.com',
    url: 'https://broowzer.com',
    broowzerShields: 'allow',
    adsBlocked: 0,
    ads: 'block',
    adsBlockedResources: [],
    httpsRedirected: 0,
    httpUpgradableResources: 'block',
    httpsRedirectedResources: [],
    id: 0,
    javascript: 'block',
    javascriptBlocked: 0,
    javascriptBlockedResources: [],
    trackers: 'block',
    trackersBlocked: 0,
    trackersBlockedResources: [],
    fingerprinting: 'block',
    fingerprintingBlocked: 0,
    fingerprintingBlockedResources: [],
    cookies: 'block',
    noScriptInfo: {},
    controlsOpen: false
  },
  shieldsToggled: (setting: BlockOptions) => {
    return { type: actionTypes.SHIELDS_TOGGLED, setting }
  },
}

describe('ShieldsHeader component', () => {
  const baseComponent = (props: Props) =>
    <ShieldsHeader {...props} />

  it('renders the component', () => {
    const wrapper = shallow(baseComponent(fakeProps))
    const assertion = wrapper.find('#broowzerShieldsHeader').length === 1
    expect(assertion).toBe(true)
  })

  it('shields toggle responds to the onChange event', () => {
    const value = { target: { checked: true } }
    const onToggleShields = jest.spyOn(fakeProps, 'shieldsToggled')
    const newProps = Object.assign(fakeProps, {
      shieldsToggled: onToggleShields
    })
    const wrapper = shallow(baseComponent(newProps))
    wrapper.find('#mainToggle').simulate('change', value)
    expect(onToggleShields).toBeCalled()
  })

  it('can toggle shields off', () => {
    const newProps = Object.assign(fakeProps, { tabData: { broowzerShields: 'block' } })
    const wrapper = shallow(baseComponent(newProps))
    const assertion = wrapper.find('#mainToggle').prop('checked')
    expect(assertion).toBe(false)
  })

  it('can toggle shields on', () => {
    // start with shields off
    const newProps1 = Object.assign(fakeProps, { tabData: { broowzerShields: 'block' } })
    const wrapper = shallow(baseComponent(newProps1))
    const assertion1 = wrapper.find('#mainToggle').prop('checked')
    expect(assertion1).toBe(false)
    // then turn it on
    const newProps2 = Object.assign(fakeProps, { tabData: { broowzerShields: 'allow' } })
    const wrapper2 = shallow(baseComponent(newProps2))
    const assertion2 = wrapper2.find('#mainToggle').prop('checked')
    expect(assertion2).toBe(true)
  })

  it('displays the hostname', () => {
    const newProps = Object.assign(fakeProps, {
      tabData: { hostname: 'https://brian-bondy-canada-do-te-karate.com' }
    })
    const wrapper = shallow(baseComponent(newProps))
    const assertion = wrapper.find('#hostname').props().children
    expect(assertion).toBe('https://brian-bondy-canada-do-te-karate.com')
  })
})
