// Modal
// ===

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['$'], factory);
    } else {
        var framework = window.Zepto || window.jQuery;
        factory(framework);
    }
}(function() {

    // Cache
    // ---

    var FOCUSABLE_ELEMENTS = 'a[href], area[href], input, select, textarea, button, iframe, object, embed, [tabindex], [contenteditable]';

    var CLASSES = {
        'siteContainer': 'site-container',
        'modal': 'modal',
        'inner': 'modal__inner',
        'overlay': 'modal__overlay',
        'openButton': 'js-open-modal',
        'closeButton': 'js-close-modal',
    };

    var EVENTS = {
        'open': 'modal:open',
        'close': 'modal:close'
    };


    // Modal Factory
    // ---

    var ModalFactory = function() {
        var self = this;

        self.modals = [];

        // Initializer
        self.init = function($modals) {
            $modals = $modals || $('.' + CLASSES.modal);

            $modals.each(function(idx, modal) {
                var modalId = $(modal).attr('id');
                var button = $('button[for="' + modalId + '"]');

                self.modals.push(new Modal(modal, button));
            });
        };
    };


    // Modal
    // ---

    var Modal = function(modal, openner) {
        var self = this;
        var $siteContainer = $('.' + CLASSES.siteContainer);

        self.$modal = $(modal);
        self.$openButton = $(openner);
        self.$closeButton = self.$modal.find('.' + CLASSES.closeButton);
        self.$overlay = self.$modal.find('.' + CLASSES.overlay);

        // Open Event Handler
        self.$modal.on(EVENTS.open, function() {
            // Hide external modal content from screen readers
            $siteContainer.attr('aria-hidden', 'true');

            // Ensure external focusable elements are unfocusable
            disableInputs($siteContainer);

            // Reveal the modal
            self.$modal.attr('hidden', null);

            // Record current state into the focus stack
            FocusManager.store(self.$openButton, self.$modal.attr('id'));

            // Send the current focus to the Modal
            FocusManager.send(self.$modal.find('.' + CLASSES.inner));
        });

        // Close Event Handler
        self.$modal.on(EVENTS.close, function() {
            if (self.$modal.attr('hidden')) return;

            // Reset all the focusable states of the content inside the modal
            self.$modal.find('.accordion__body.is-open').each(function(idx, item) {
                // The purpose of this functionality is to display the potential
                // for a unique use case: where you want to close a context and
                // also reset any nested contexts as well. In this case, closing
                // a modal should also close all open accordion items too.
                $item = $(item).siblings('.accordion__head');
                $item.trigger('accordion:change');
            });

            // Un-hide the main content for screenreaders
            $siteContainer.attr('aria-hidden', 'false');

            // Restore the focusability of the external focusable elements
            enableInputs($siteContainer);

            // Hide the modal
            self.$modal[0].setAttribute('hidden', '');

            // Return to the last focus status in the stack
            FocusManager.restore(self.$modal.attr('id'));
        });

        // Open Triggers
        self.$openButton.click(function() {
            self.$modal.trigger(EVENTS.open);
        });

        // Close Button Trigger
        self.$closeButton.click(function() {
            self.$modal.trigger(EVENTS.close);
        });

        // Overlay Trigger
        self.$overlay.click(function() {
            self.$modal.trigger(EVENTS.close);
        });

        // "Escape" Key Trigger
        self.$modal.keyup(function(e) {
            if (e.keyCode == 27) self.$modal.trigger(EVENTS.close);
        });
    };


    // Focus Lock
    // ---

    var disableInputs = function($elem) {
        var $focusableElements = $elem.find(FOCUSABLE_ELEMENTS);

        $focusableElements.each(function(_, el) {
            var $el = $(el);
            var currentTabIndex = $el.attr('tabindex') || 0;

            $el
                .attr('data-orig-tabindex', currentTabIndex)
                .attr('tabindex', '-1');
        });
    };

    var enableInputs = function($elem) {
        $elem.find('[data-orig-tabindex]').each(function(_, el) {
            var $el = $(el);
            var hasOrigTabindex = $el.attr('data-orig-tabindex');
            var oldTabIndex = parseInt($el.attr('data-orig-tabindex'));

            if (oldTabIndex !== NaN) {
                $el.attr('tabindex', oldTabIndex);
            } else {
                $el.removeAttr('tabindex');
            }

            $el.removeAttr('data-orig-tabindex');
        });
    };


    // Init
    // ---

    // var modals = new ModalFactory();
    // modals.init();

    return ModalFactory;

}));
