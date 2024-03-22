module Chemotion
  class PredictionAPI < Grape::API
    # before do
      # return 401 unless current_user.matrix_check_by_name("reactionPrediction")
    # end

    resource :prediction do

      resource :products do
        desc 'Forward prediction'
        params do
          requires :reactant, type: String
          requires :reagent, type: String
          requires :solvent, type: String
          requires :num_res, type: String
          optional :products, type: String
          requires :flag, type: Boolean

        end
        post do
          reactant = params[:reactant]
          reagent = params[:reagent]
          solvent = params[:solvent]
          num_res = params[:num_res]
          products = params[:products]
          flag = params[:flag]
          Ai::Forwardinf.products(reactant, reagent, solvent, num_res, products, flag)
        end
      end

      resource :retro do
        desc 'Retro reaction prediction'
        params do
          optional :smis, type: String
        end
        post do
          smis = params[:smis]
          Ai::Forwardinf.retro(smis)
        end
      end

      resource :retrov2 do
        desc 'Retro reaction prediction'
        params do
          optional :smis, type: String
        end
        post do
          smis = params[:smis]
          Ai::Forwardinf.retrov2(smis)
        end
      end

      resource :template do
        desc 'Template info'
        params do
          optional :template_id, type: String
        end
        post do
          templateid = params[:template_id]
          Ai::Forwardinf.fetchTemplate(templateid)
        end
      end

      resource :png do
        desc 'Png file'
        params do
          optional :smiles, type: String
        end
        post do
          smis = params[:smiles]
          Ai::Forwardinf.fetchSvg(smis)
        end
      end

      
    end
  end
end
