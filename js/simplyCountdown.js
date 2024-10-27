/*!
 * Project : simply-countdown
 * File : simplyCountdown
 * Date : 27/06/2015
 * License : MIT
 * Version : 1.3.2
 * Author : Vincent Loy <vincent.loy1@gmail.com>
 * Contributors : 
 *  - Justin Beasley <JustinB@harvest.org>
 *  - Nathan Smith <NathanS@harvest.org>
 */
/*global window, document*/
(function (exports) {
    'use strict';

    var extend, createElements, createCountdownElt, simplyCountdown;

    /**
     * Function that merges user parameters with defaults.
     * @param {Object} out - The output object to be extended.
     * @returns {Object}
     */
    extend = function (out) {
        var i, obj, key;
        out = out || {};

        for (i = 1; i < arguments.length; i++) {
            obj = arguments[i];
            if (obj) {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (typeof obj[key] === 'object') {
                            extend(out[key], obj[key]);
                        } else {
                            out[key] = obj[key];
                        }
                    }
                }
            }
        }
        return out;
    };

    /**
     * Function that creates a countdown section.
     * @param {HTMLElement} countdown - The container for countdown.
     * @param {Object} parameters - The configuration parameters.
     * @param {String} typeClass - The class type for the section.
     * @returns {Object} - DOM elements of the countdown.
     */
    createCountdownElt = function (countdown, parameters, typeClass) {
        var sectionTag, amountTag, wordTag, innerSectionTag;

        sectionTag = document.createElement('div');
        amountTag = document.createElement('span');
        wordTag = document.createElement('span');
        innerSectionTag = document.createElement('div');

        innerSectionTag.appendChild(amountTag);
        innerSectionTag.appendChild(wordTag);
        sectionTag.appendChild(innerSectionTag);

        sectionTag.classList.add(parameters.sectionClass, typeClass);
        amountTag.classList.add(parameters.amountClass);
        wordTag.classList.add(parameters.wordClass);

        countdown.appendChild(sectionTag);

        return {
            full: sectionTag,
            amount: amountTag,
            word: wordTag
        };
    };

    /**
     * Function that creates full countdown DOM elements.
     * @param {Object} parameters - The configuration parameters.
     * @param {HTMLElement} countdown - The countdown container.
     * @returns {Object} - Countdown DOM elements for days, hours, minutes, seconds.
     */
    createElements = function (parameters, countdown) {
        if (!parameters.inline) {
            return {
                days: createCountdownElt(countdown, parameters, 'simply-days-section'),
                hours: createCountdownElt(countdown, parameters, 'simply-hours-section'),
                minutes: createCountdownElt(countdown, parameters, 'simply-minutes-section'),
                seconds: createCountdownElt(countdown, parameters, 'simply-seconds-section')
            };
        }
        var spanTag = document.createElement('span');
        spanTag.classList.add(parameters.inlineClass);
        return spanTag;
    };

    /**
     * Main countdown function.
     * @param {String} elt - Selector for the element.
     * @param {Object} args - Configuration parameters.
     */
    simplyCountdown = function (elt, args) {
        var parameters = extend({
                year: 2024,
                month: 10,
                day: 30,
                hours: 3,
                minutes: 30,
                seconds: 0,
                words: {
                    days: 'day',
                    hours: 'hour',
                    minutes: 'minute',
                    seconds: 'second',
                    pluralLetter: 's'
                },
                plural: true,
                inline: false,
                enableUtc: true,
                onEnd: function () {},
                refresh: 1000,
                inlineClass: 'simply-countdown-inline',
                sectionClass: 'simply-section',
                amountClass: 'simply-amount',
                wordClass: 'simply-word',
                zeroPad: false
            }, args),
            interval,
            targetDate,
            now,
            secondsLeft,
            days,
            hours,
            minutes,
            seconds;

        var cd = document.querySelectorAll(elt);
        var targetTmpDate = new Date(parameters.year, parameters.month-2, parameters.day, parameters.hours, parameters.minutes, parameters.seconds);

        targetDate = parameters.enableUtc
            ? new Date(
                  targetTmpDate.getUTCFullYear(),
                  targetTmpDate.getUTCMonth(),
                  targetTmpDate.getUTCDate(),
                  targetTmpDate.getUTCHours(),
                  targetTmpDate.getUTCMinutes(),
                  targetTmpDate.getUTCSeconds()
              )
            : targetTmpDate;

        Array.prototype.forEach.call(cd, function (countdown) {
            var fullCountDown = createElements(parameters, countdown);

            var refresh = function () {
                now = (new Date()).getUTCDate();
                console.log('Target Date:', targetDate);  // Debugging log for the target date
                console.log('Now:', now);                 // Debugging log for current date/time
                
                secondsLeft = (targetDate.getTime() - now.getTime()) / 1000;
            
                if (secondsLeft > 0) {
                    days = Math.floor(secondsLeft / 86400);
                    secondsLeft %= 86400;
            
                    hours = Math.floor(secondsLeft / 3600);
                    secondsLeft %= 3600;
            
                    minutes = Math.floor(secondsLeft / 60);
                    seconds = Math.floor(secondsLeft % 60);
                } else {
                    days = hours = minutes = seconds = 0;
                    window.clearInterval(interval);
                    parameters.onEnd();
                }
            
                console.log('Days left:', days);  // Debugging log for days left

                var dayWord = days > 1 ? parameters.words.days + parameters.words.pluralLetter : parameters.words.days;
                var hourWord = hours > 1 ? parameters.words.hours + parameters.words.pluralLetter : parameters.words.hours;
                var minuteWord = minutes > 1 ? parameters.words.minutes + parameters.words.pluralLetter : parameters.words.minutes;
                var secondWord = seconds > 1 ? parameters.words.seconds + parameters.words.pluralLetter : parameters.words.seconds;

                if (parameters.inline) {
                    countdown.innerHTML = `${days} ${dayWord}, ${hours} ${hourWord}, ${minutes} ${minuteWord}, ${seconds} ${secondWord}.`;
                } else {
                    fullCountDown.days.amount.textContent = parameters.zeroPad && days < 10 ? '0' + days : days;
                    fullCountDown.days.word.textContent = dayWord;

                    fullCountDown.hours.amount.textContent = parameters.zeroPad && hours < 10 ? '0' + hours : hours;
                    fullCountDown.hours.word.textContent = hourWord;

                    fullCountDown.minutes.amount.textContent = parameters.zeroPad && minutes < 10 ? '0' + minutes : minutes;
                    fullCountDown.minutes.word.textContent = minuteWord;

                    fullCountDown.seconds.amount.textContent = parameters.zeroPad && seconds < 10 ? '0' + seconds : seconds;
                    fullCountDown.seconds.word.textContent = secondWord;
                }
            };

            refresh();
            interval = window.setInterval(refresh, parameters.refresh);
        });
    };

    exports.simplyCountdown = simplyCountdown;
}(window));

/*global $, jQuery, simplyCountdown*/
if (window.jQuery) {
    (function ($, simplyCountdown) {
        'use strict';

        function simplyCountdownify(el, options) {
            simplyCountdown(el, options);
        }

        $.fn.simplyCountdown = function (options) {
            return simplyCountdownify(this.selector, options);
        };
    }(jQuery, simplyCountdown));
}
